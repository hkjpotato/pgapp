export default function getSvgPosition(container, { clientX, clientY }) {
  var svg = container.ownerSVGElement || container;
  var pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(container.getScreenCTM().inverse());
}

