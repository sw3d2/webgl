import tmap from './tmap.js';

const HEIGHT_STEP = 50;

console.log('treemap:', tmap);

export function get() {
  let res = [];
  flatten(tmap, res, 0);
  console.log('boxlist:', res);
  return res;
}

function flatten(treemap, boxlist, depth) {
  let { x0, x1, y0, y1 } = treemap;

  boxlist.push({
    x: { min: x0, max: x1 },
    y: { min: y0, max: y1 },
    z: { min: HEIGHT_STEP * depth, max: HEIGHT_STEP * (depth + 1) },
  });

  for (let subnode of treemap.children || [])
    flatten(subnode, boxlist, depth + 1);
}
