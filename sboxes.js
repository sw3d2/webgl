export function get() {
  let res = [];

  for (let i = 0; i < 1000; i++) {
    let x = Math.random() * 2000 - 1000;
    let y = Math.random() * 2000 - 1000;
    let z = Math.random() * 2000 - 1000;

    res.push({
      pos: { x, y, z },
    });
  }

  return res;
}
