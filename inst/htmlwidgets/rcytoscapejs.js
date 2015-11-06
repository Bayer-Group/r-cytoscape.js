HTMLWidgets.widget({
    name: 'rcytoscapejs',
    type: 'output',

    initialize: function (el, width, height) {
        /*var loadingSpan = document.createElement('span');
        loadingSpan.setAttribute("class", "fa fa-refresh fa-spin");
        loadingSpan.setAttribute("id", "loading");
        el.appendChild(loadingSpan);*/
        return {
        }
    },

    resize: function (el, width, height, instance) {
        if (instance.cy)
            instance.cy.resize();
    },

    renderValue: function (el, x, instance) {
        //console.log(x.nodeEntries);
        //console.log(x.edgeEntries);

        //var nodetest = JSON.parse(x.nodeEntries);
        //var edgetest = JSON.parse(x.edgeEntries);

        //console.log(nodetest);
        //console.log(edgetest);
        
        var defaults = ({
          zoomFactor: 0.05, // zoom factor per zoom tick
          zoomDelay: 45, // how many ms between zoom ticks
          minZoom: 0.1, // min zoom level
          maxZoom: 10, // max zoom level
          fitPadding: 50, // padding when fitting
          panSpeed: 10, // how many ms in between pan ticks
          panDistance: 10, // max pan distance per tick
          panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
          panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
          panInactiveArea: 8, // radius of inactive area in pan drag box
          panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
          autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)
      
          // icon class names
          sliderHandleIcon: 'fa fa-minus',
          zoomInIcon: 'fa fa-plus',
          zoomOutIcon: 'fa fa-minus',
          resetIcon: 'fa fa-expand'
        });
        
        var positionMap = {};
        
        //add position information to data for preset layout
        for (var i = 0; i < x.nodeEntries.length ; i++){
            var xPos = x.nodeEntries[i].data.x;
            var yPos = x.nodeEntries[i].data.y;
            positionMap[x.nodeEntries[i].data.id] = {'x':parseFloat(xPos), 'y':parseFloat(yPos)};
        }

        instance.cy = new cytoscape({
            container: el,
            style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'color': 'data(nodeLabelColor)',
                    'content': 'data(name)',
                    'text-valign': 'center',
                    'shape': 'data(shape)',
                    'text-outline-color': 'data(color)',
                    'background-color': 'data(color)',
                    'width': 'data(width)',
                    'height': 'data(height)',
                    'font-size': '36px',
                    'min-zoomed-font-size': '7px'
                })
                .selector('edge')
                .css({
                    
                    'line-color': 'data(color)',
                    'width': 'data(width)',
                    'curve-style': 'haystack',
                    'haystack-radius': '0'
                })
                .selector(':selected')
                .css({
                    //'background-color': '#FF00FF',
                    'border-style': 'solid',
                    'border-width': '30px',
                    'border-color': '#FFFF00'
                })
                .selector('.highlighted')
                .css({
                    'background-color': '#FF00FF',
                    'line-color': '#FF00FF',
                    'target-arrow-color': '#FF00FF',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.5s'
                })
                .selector('.faded')
                .css({
                    'opacity': 0.25,
                    'text-opacity': 0
                }),
                
            elements: {
                nodes: x.nodeEntries,
                //nodes: [{ data: { id:'509209821', name:'509209821', color:'#888888', shape:'ellipse', href:''} }, { data: { id:'531376085', name:'531376085', color:'#888888', shape:'ellipse', href:''} }],
                edges: x.edgeEntries
                //edges: [{ data: { source:'509209821', target:'531376085', color:'#888888', edgeSourceShape:'none', edgeTargetShape:'triangle'} }]

            },
            layout: {
                name: x.layout,
                ungrabifyWhileSimulating: true,
                positions: positionMap
            },
            
            ready: function () {
                window.cy = this;
  
                if(x.showPanzoom) {
                  cy.panzoom(defaults);                  
                }

                Shiny.addCustomMessageHandler("filterCallback",
                                               function(node_ids) {
                                                 cy.$(".highlighted").toggleClass("highlighted");
                                                 cy.$(":selected").trigger("unselect");
                                                 if(!Array.isArray(node_ids)) {
                                                   node_ids = [node_ids];
                                                 }
                                                 if(node_ids.length < 1) {
                                                    return;
                                                 }
                                                 var selector_string = "#" + node_ids[0];
                                                 for (var i = 1; i < node_ids.length; i++) {
                                                   selector_string += ", #" + node_ids[i];
                                                 }
                                                 if(node_ids.length == 1) {
                                                   cy.zoom(0.31);
                                                   cy.center(cy.$(selector_string));
                                                 }
                                                 cy.$(":selected").unselect()
                                                 cy.$(selector_string).select();
                                                 Shiny.onInputChange("clickedNode", 
                                                   cy.$(".highlighted, :selected").map(function(node) {return node._private.data.id}));
                                               });

                cy.boxSelectionEnabled(true);
                cy.userZoomingEnabled(true);
                cy.on('tap', 'node', function (event) {
                    /*
                    var nodeHighlighted = this.hasClass("highlighted");
                    console.log(nodeHighlighted);
                    console.log("A:" + el.id);
                    console.log("ID:" + this._private.data.id);
                    console.log("break");
                    
                    //var nodes = this.closedNeighborhood().connectedNodes();
                    var nodes = [];
                    //console.log(nodes);

                    if (nodes.length === 0) {
                        if (nodeHighlighted) {
                          console.log("Node is highlighted");
                          this.toggleClass("highlighted", false);
                        } else {
                          console.log("Node is not highlighted");
                          this.toggleClass("highlighted", true);
                        }
                        
                    }
                    
                    
                    if (nodeHighlighted) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].hasClass("highlighted")) {
                                nodes[i].toggleClass("highlighted");
                            }
                        }
                    } else {
                        for (var i = 0; i < nodes.length; i++) {
                            if (!nodes[i].hasClass("highlighted")) {
                                nodes[i].toggleClass("highlighted");
                            }
                        }
                    }

                    var globalnodes = instance.cy.nodes();
                    var selected = [];
                    for (var i = 0; i < globalnodes.length; i++) {
                        if (globalnodes[i].hasClass("highlighted")) {
                            selected.push(globalnodes[i]._private.ids);
                        }
                    }

                    //console.log(globalnodes);
                    //console.log(selected);

                    var keys = [];
                    for (var i = 0; i < selected.length; i++) {
                        var kk = selected[i];
                        for (var k in kk) keys.push(k);
                    }
                    console.log(keys);
                    
                    Shiny.onInputChange("connectedNodes", keys);
                    Shiny.onInputChange("clickedNode", 
                                   cy.$(".highlighted, :selected").map(
                                     function(node) {return node._private.data.id}));
                    */               
                });
                
                /*cy.on('select', function (event) {
                  // var clicked_nodes = cy.$(".highlighted").map(function(node) {return node._private.data.id});
                  //alert(JSON.stringify(Object.keys(event.cyTarget)));
                  //alert(JSON.stringify(event.cyTarget.length));
                  alert(JSON.stringify(event.cyTarget._private.data));
                  
                  //Shiny.onInputChange("clickedNode",  clicked_nodes);
                })*/
                window.old_clicked_nodes = [];
                window.old_pan = [];
                window.old_zoom = [];
                if (window.intervalId) {
                  window.clearInterval(window.intervalId);
                }
                window.intervalId = window.setInterval(function() {
                  var clicked_nodes = cy.$(".highlighted, :selected").map(function(node) {return node._private.data.id});
                  if (clicked_nodes != window.old_clicked_nodes) {
                    Shiny.onInputChange("clickedNode",  clicked_nodes);
                    window.old_clicked_nodes = clicked_nodes;
                  }
                  var pan = cy.pan();
                  var zoom = cy.zoom();
                  if (pan != window.old_pan || zoom != window.old_zoom) {
                    Shiny.onInputChange("zoom",  zoom);
                    Shiny.onInputChange("pan",  pan);
                    window.old_pan = pan;
                    window.old_zoom = zoom;
                  }
                }, 400.0);
                
                cy.on('tap', 'node', function (event) {
                    
                    var node = this;
                    $(".qtip").remove();
                    //console.log(event);
                    
                    var name = node._private.data.name; 
                    var href = node._private.data.href; 

                    var target = event.cyTarget;
                    var sourceName = target.data("id");
                    var targetName = target.data("href");
                    console.log(sourceName);
                    //console.log(targetName);

                    //var x = event.cyRenderedPosition.x;
                    //var y = event.cyRenderedPosition.y;
                    //var x = event.cyPosition.x;
                    //var y = event.cyPosition.y;
                    //console.log("x="+x+" Y="+y);

                    cy.getElementById(node.id()).qtip({
                        content: {
                            text: function (event, api) {
                              // Retrieve content from custom attribute of the $('.selector') elements.
                              return href;
                            }
                        },
                        show: {
                            ready: true
                        },
                        position: {
                            my: 'top center',
                            at: 'bottom center',
                            adjust: {
                              cyViewport: true
                            },
                            effect: false
                        },
                        hide: {
                            fixed: true,
                            event: false
                            //delay: 10000
                            //inactive: 1000
                        },
                        style: {
                            classes: 'qtip-bootstrap',
                            tip: {
                              width: 16,
                              height: 8
                            }
                        }
                    });
                });
                if (x.layout != "preset"){
                  var node_positions = cy.$("node").map(
                    function(node) {
                        var position = node.position(); 
                        position["name"] = node._private.data.short_name; 
                        return position;
                    });
                  Shiny.onInputChange("nodeLayout", node_positions);
                }
                // document.getElementById("loading").classList.add("loaded");
                Shiny.onInputChange("cytoscapeReady", true);
            }
        });
    }
});
