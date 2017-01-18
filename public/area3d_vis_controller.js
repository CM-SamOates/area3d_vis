import _ from 'lodash';
import uiModules from 'ui/modules';
import $ from 'jquery';
const module = uiModules.get('kibana/area3d_vis', ['kibana']);

import vis3D from 'vis'; //Load vis.js from node_modules

module.controller('KbnArea3DVisController', function ($scope, $element, Private) {

  let rootElement = $element;

  let graph = null;
  let width;
  let height;
  let data = new vis3D.DataSet();

  let margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };

  $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {

    if (resp) {
      const vis = $scope.vis;
      let counter = 0;

      width = $(rootElement).width() - margin.left - margin.right;
      height = $(rootElement).height() - margin.top - margin.bottom;

      let x = 0.0;
      let y = 0.0;
      let z = 0.0;
      let cols = 0;
      let rows = 0;

      // Go from Elasticsearch resp object to vis.js Dataset
      _.map(resp.aggregations, function (xElementRoot) {
        if (xElementRoot !== null) {
          _.map(xElementRoot.buckets, function (xElement) {
            if (xElement !== null) {
              x = parseFloat(xElement.key);
              cols++;
              _.map(xElement[3].buckets, function (yElementBucket) {

                y = parseFloat(yElementBucket.key);
                rows++;

                if (yElementBucket.hasOwnProperty('1')) {
                  z = parseFloat(yElementBucket[1].value);
                } else {
                  z = yElementBucket.doc_count;
                }

                if (vis.params.zMin !== null && z < vis.params.zMin) {
                    z = vis.params.zMin;
                }

                if (vis.params.zMax !== null && z > vis.params.zMax) {
                    z = vis.params.zMax;
                }

                data.add({
                  id: counter++,
                  x: x,
                  y: y,
                  z: z,
                  style: z
                });

              });
            }
          });
        }
      });

      // Set Graphics Type
      let graphType = vis.params.graphSelect !== null ? vis.params.graphSelect.id : 'surface';

      // specify options
      var options = {
        width: width + 'px',
        height: height + 'px',
        style: graphType,
        xBarWidth: 5,
        yBarWidth: 5,
        showPerspective: vis.params.showPerspective,
        showGrid: vis.params.showGrid,
        showShadow: vis.params.showShadow,
        keepAspectRatio: vis.params.keepAspectRatio,
        verticalRatio: 0.5,
        xLabel: vis.params.xLabel !== null ? vis.params.xLabel : 'X',
        yLabel: vis.params.yLabel !== null ? vis.params.yLabel : 'Y',
        zLabel: vis.params.zLabel !== null ? vis.params.zLabel : 'Z',
        legendLabel: vis.params.legend !== null ? vis.params.legend : 'I am legend',
        tooltip: vis.params.tooltip
      };

      if (vis.params.zMin !== null) {
        options.valueMin = vis.params.zMin;
      }

      if (vis.params.zMax !== null) {
        options.valueMax = vis.params.zMax;
      }

      // Instantiate our graph object.
      graph = new vis3D.Graph3d(rootElement[0]); // , data, options

      graph.setOptions(options);
      graph.setData(data);

      if (vis.params.topDownCamera) {
        var pos = {
          horizontal: 3.14,
          vertical: 1.57,
          distance: vis.params.defaultZoom !== null ? vis.params.defaultZoom : 2.0
        };
        graph.setCameraPosition(pos);
      }

    }
  });

  $scope.$watch(function () {
    let element = $(rootElement);

    return [element.width(), element.height()].join('x');
  }, function (resp) {

    let element = $(rootElement);
    let height = element.height();
    let width = element.width();

    if (width >= 200 && height >= 200) {
      if (data && graph) {
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;
        graph.setSize(width + 'px', height + 'px');
        graph.redraw();
      }
    }
  });
});
