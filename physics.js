
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

function resolveBodyBody(bt0, bn0, bt1, bn1) {

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

var diff = v2.create();
var springDiffs = [v2.create(), v2.create(), v2.create()];
function segmentSprings(triangles, lengths, alpha) {
  for (var i = 0; i < springDiffs.length; i++) {
    v2.set(springDiffs[i], 0, 0);
  }

  for (var i = 0; i < triangles.length; i++) {
    var triangle = triangles[i];

    for (var j = 0; j < 3; j++) {
      var p0 = triangle[j];
      var p1 = triangle[(j+1)%3];

      v2.sub(diff, p1, p0);
      var current = v2.length(diff);
      var delta = lengths[i][j] - current;
      v2.scale(diff, diff, alpha*delta/(4*lengths[i][j]));

      var spring0 = springDiffs[j];
      var spring1 = springDiffs[(j+1)%3];
      v2.sub(spring0, spring0, diff);
      v2.add(spring1, spring1, diff);
    }

    for (var j = 0; j < 3; j++) {
      v3.add(triangles[i][j], triangles[i][j], springDiffs[j]);
    }
  }
}

function averageCommonPoints(triangles, ids, counts, averaged) {
  for (var i = 0; i < averaged.length; i++) {
    v2.set(averaged[i], 0, 0);
  }

  counts.fill(1);
  for (var i = 0; i < ids.length; i++) {
    for (var j = 0; j < 3; j++) {
      var id = ids[i][j];
      var current = averaged[id];
      v2.sub(diff, triangles[i][j], current);
      v2.scale(diff, diff, 1/counts[id]);
      v2.add(current, current, diff);
      counts[id]++;
    }
  }

  for (var i = 0; i < triangles.length; i++) {
    for (var j = 0; j < 3; j++) {
      v2.copy(triangles[i][j], averaged[ids[i][j]]);
    }
  }
}

return { computeBodyNormals, collideBodyBody,
  collideBodyPoint, segmentSprings, averageCommonPoints,
  trianglesMin, trianglesMax };

})();

