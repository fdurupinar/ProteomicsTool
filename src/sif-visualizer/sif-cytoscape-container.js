/**
 * Created by durupina on 8/31/16.
 */


var sifContainer;

function loadBackboneViews(){

    var inputView = new InputView();
}

function convertSifToCytoscape(input, groupTopology){

    var interactions = SIFJS.parse(input);

    var nodes = [];
    interactions.nodes.forEach(function (node) {
        var node = {data:{id:node.id}};
        nodes.push(node);

    });

    var edges = [];
    interactions.edges.forEach(function(edge){
        var edge = {data:{id: edge.id, source: edge.source, target: edge.target, edgeType: edge.edgeType}};
        edges.push(edge);
    });


    var cyElements = {nodes: nodes, edges: edges};

    if(groupTopology)
        return topologyGrouping(cyElements);
    else
        return cyElements;

}




var loadSifModel = function(input, groupTopology){

    var cyElements = convertSifToCytoscape(input, groupTopology);
    if(sifContainer) {
        cy.remove(cy.elements());
        sifContainer.model = cyElements;
    }
    else
        sifContainer = new SifContainer({ model: cyElements});


    sifContainer.render();
}


var InputView = Backbone.View.extend({
    el: '#input-container',

    tagName: 'textarea',

    events: {
        "click #sif-text-submit-button" : "getSifData",
        "click #sif-text-clear-button" : "clearTextArea",
        "change #sif-file-input": "loadSifFile"
    },

    variables: {
        sifText: 'a controls-state-change-of b\n'
    },



    initialize : function() {

        this.variables.sifText += "b controls-expression-of c\n";
        this.variables.sifText += "e controls-expression-of c\n";
        this.variables.sifText += "a controls-state-change-of e\n";
        this.variables.sifText += "e controls_state_change_of b\n";
        this.variables.sifText += "b controls_state_change_of e\n";


        this.render();
    },
    render: function(){

        // compile the template using underscore
        var template = _.template( $("#input-loading-template").html());
        // pass variables in using Underscore.js template
        template = template(this.variables);

        // load the compiled HTML into the Backbone "el"
        $(this.el).html(template);

        return this;
    },

    getSifData: function(e) {
        loadSifModel($('#sifBox').val(), $('#sif-topology-grouping')[0].checked);
    },

    loadSifFile: function(e){

        var reader = new FileReader();

        reader.onload = function (e) {

            loadSifModel(this.result,  $('#sif-topology-grouping')[0].checked);
        };
        reader.readAsText($("#sif-file-input")[0].files[0]);

    },

    clearTextArea: function(){
        this.variables.sifText = '';
        this.render();
    }

});

var SifContainer = Backbone.View.extend({
    el: '#graph-container',

    initialize: function () {
        var self = this;
        self.template = _.template($("#sif-view-template").html());
    },

    render: function () {

        var self = this;

        var cyElements = this.model;

        var cy = window.cy = cytoscape({
            container: this.el,

            boxSelectionEnabled: true,
            autounselectify: false,


            layout: {
                animate: false,
                fit: true,
                randomize: false,
                nodeRepulsion: 4500,
                idealEdgeLength: 50,
                edgeElasticity: 0.45,
                nestingFactor: 0.1,
                gravity: 0.25,
                numIter: 2500,
                tile: true,
                tilingPaddingVertical:5,
                tilingPaddingHorizontal:5,
                name: 'cose-bilkent'

            },

            style: SifStyleSheet,

            elements: cyElements,

            ready: function () {
                cy.on('tapend', 'node', function (e) {
                    console.log(this);
                });

                cy.on('tapend', 'edge', function (e) {

                    var edge = this;

                    edge.qtip({
                        content: function () {
                            var contentHtml = "<b style='text-align:center;font-size:16px;'>" + edge._private.data.edgeType + "</b>";
                            return contentHtml;
                        },
                        show: {
                            ready: true
                        },
                        position: {
                            my: 'top center',
                            at: 'bottom center',
                            adjust: {
                                cyViewport: true
                            }
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
            }

        });

        return this;
    }
});


