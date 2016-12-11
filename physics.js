
Physics = (function() {

function triangleSeparationHalf(t0, n0, t1, n1) {
  for (var i = 0; i < n0.length; i++) {
    var max0 = -Infinity, min0 = Infinity;
    var max1 = -Infinity, min1 = Infinity;

    for (var j = 0; j < t0.length; j++) {
      var dot = v2.dot(n0[i], t0[j]);
      min0 = Math.min(dot, min0);
      max0 = Math.max(dot, max0);
    }

    for (var j = 0; j < t1.length; j++) {
      var dot = v2.dot(n0[i], t1[j]);
      min1 = Math.min(dot, min1);
      max1 = Math.max(dot, max1);
    }

    if (max0 < min1 || min0 > max1) return true;
  }
}

function triangleSeparation(t0, n0, t1, n1) {
  return triangleSeparationHalf(t0, n0, t1, n1)
    || triangleSeparationHalf(t1, n1, t0, n0);
}

function trianglesMax(result, triangles) {
  v2.copy(result, triangles[0][0]);
  for (var i = 1; i < triangles.length; i++) {
    for (var j = 0; j < 3; j++) {
      result[0] = Math.max(triangles[i][j][0], result[0]);
      result[1] = Math.max(triangles[i][j][1], result[1]);
    }
  }
  return result;
}

function trianglesMin(result, triangles) {
  v2.copy(result, triangles[0][0]);
  for (var i = 1; i < triangles.length; i++) {
    for (var j = 0; j < 3; j++) {
      result[0] = Math.min(triangles[i][j][0], result[0]);
      result[1] = Math.min(triangles[i][j][1], result[1]);
    }
  }
  return result;
}

var min0 = v2.create();
var max0 = v2.create();
var min1 = v2.create();
var max1 = v2.create();
function collideBodyBody(bt0, bn0, bt1, bn1) {
  trianglesMin(min0, bt0);
  trianglesMax(max0, bt0);
  trianglesMin(min1, bt1);
  trianglesMax(max1, bt1);

  if (min0[0] > max1[0] || max0[0] < min1[0]) return false;
  if (min0[1] > max1[1] || max0[1] < min1[1]) return false;

  for (var i = 0; i < bt0.length; i++) {
    for (var j = 0; j < bt1.length; j++) {
      if (!triangleSeparation(bt0[i], bn0[i], bt1[j], bn1[j])) return true;
    }
  }

  return false;
}

var fakeTriangle = [[]];
var fakeNormals = [[0,1]];
function collideBodyPoint(bt0, bn0, point) {
  trianglesMin(min0, bt0);
  trianglesMax(max0, bt0);

  if (point[0] < min0[0] || point[0] > max0[0]) return false;
  if (point[1] < min0[1] || point[1] > max0[1]) return false;

  fakeTriangle[0] = point;
  for (var i = 0; i < bt0.length; i++) {
    if (!triangleSeparation(bt0[i], bn0[i], fakeTriangle, fakeNormals)) {
      return true;
    }
  }
  
  return false;
}

var rotPIO2 = m2.fromRotation(m2.create(), Math.PI/2);
function computeBodyNormals(result, triangles) {
  for (var i = 0; i < triangles.length; i++) {
    for (var j = 0; j < triangles[i].length; j++) {
      v2.sub(result[i][j], triangles[i][(j+1)%3], triangles[i][j]);
      v2.transformMat2(result[i][j], result[i][j], rotPIO2);
      v2.normalize(result[i][j], result[i][j]);
    }
  }
}

function computeBodyCenter(result, triangles) {
  v2.set(result, 0, 0);
  var target = result;

  for (var i = 0; i < triangles.length; i++) {
    for (var j = 0; j < 3; j++) {
      v2.sub(diff, triangles[i][j], target);
      v2.scale(diff, diff, 1/(3*i+j+1));
      v2.add(target, target, diff);
    }
  }
}

function computeTriangleCenters(result, triangles) {
  for (var i = 0; i < triangles.length; i++) {
    v2.set(result[i], 0, 0);
  }

  for (var i = 0; i < triangles.length; i++) {
    var target = result[i];
    for (var j = 0; j < 3; j++) {
      v2.sub(diff, triangles[i][j], target);
      v2.scale(diff, diff, 1/(j+1));
      v2.add(target, target, diff);
    }
  }
}

var diff = v2.create();
function segmentSprings(lines, lengths, points, alpha, counts, shifts) {
  for (var i = 0; i < shifts.length; i++) {
    v2.set(shifts[i], 0, 0);
  }

  counts.fill(0);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var p0 = points[line[0]];
    var p1 = points[line[1]];

    v2.sub(diff, p1, p0);
    var current = v2.length(diff);
    var delta = lengths[i] - current;
    v2.scale(diff, diff, alpha*delta/(4*lengths[i]));

    var shift0 = shifts[line[0]];
    var shift1 = shifts[line[1]];
    v2.sub(shift0, shift0, diff);
    v2.add(shift1, shift1, diff);
    counts[line[0]]++;
    counts[line[1]]++;
  }

  for (var i = 0; i < shifts.length; i++) {
    v2.scale(shifts[i], shifts[i], 1/counts[i]);
    v2.add(points[i], points[i], shifts[i]);
  }
}

function replicateCommonPoints(triangles, ids, common) {
  for (var i = 0; i < triangles.length; i++) {
    for (var j = 0; j < 3; j++) {
      v2.copy(triangles[i][j], common[ids[i][j]]);
    }
  }
}

function extractCommonPoints(triangles, ids, common) {
  for (var i = 0; i < ids.length; i++) {
    for (var j = 0; j < 3; j++) {
      v2.copy(common[ids[i][j]], triangles[i][j]);
    }
  }
}

var draftShift = v2.create();
function shiftBody(points, anchor, amount, strength) {
  for (var i = 0; i < points.length; i++) {
    var target = points[i];
    var weight = Math.exp(-v2.distance(target, anchor)/strength);
    v2.scale(draftShift, amount, weight);
    v2.add(target, target, draftShift);
  }
}

var min = v2.create();
var max = v2.create();
function boundaryDampening(triangles, direction, width, height) {
  trianglesMin(min, triangles);
  trianglesMax(max, triangles);
  
  var dampening = 1;
  if (min[0] < 0) {
    dampening *= 1 - Math.max(0, v2.dot(direction, [-1,0]));
  }

  if (min[1] < 0) {
    dampening *= 1 - Math.max(0, v2.dot(direction, [0,-1]));
  }

  if (max[0] > width) {
    dampening *= 1 - Math.max(0, v2.dot(direction, [1,0]));
  }

  if (max[1] > height) {
    dampening *= 1 - Math.max(0, v2.dot(direction, [0,1]));
  }

  return dampening;
}

return { computeBodyNormals, computeTriangleCenters,
  computeBodyCenter, collideBodyBody, collideBodyPoint,
  segmentSprings, extractCommonPoints, replicateCommonPoints,
  trianglesMin, trianglesMax, shiftBody, boundaryDampening };

})();

