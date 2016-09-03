/**
 * Created by durupina on 8/31/16.
 */
/**
 * Codes edge types by color, line type etc.
 * @param edgeType
 * @returns {{color:'', linestyle:}}
 */
function attributeMap(edgeType){
    var attributes = {color: 'gray', lineStyle: 'solid'};

    switch(edgeType){
        case "controls-state-change-of":
            attributes["color"] = "coral";
            attributes["lineStyle"]= "dashed";
            break;
        case "controls-transport-of":
            attributes["color"] = "blue";
            break;
        case "controls-phosphorylation-of":
            attributes["color"] =  "teal";
            break;
        case "controls-expression-of":
            attributes["color"] =  "deeppink";
            break;
        case "catalysis-precedes":
            attributes["color"] =  "red";
            break;
        case "in-complex-with":
            attributes["color"] =  "steelblue";
            break;
        case "interacts-with":
            attributes["color"] =  "aquamarine";
            break;
        case "neighbor-of":
            attributes["color"] =  "lime";
            break;
        case "consumption-controled-by":
            attributes["color"] =  "yellow";
            break;
        case "controls-production-of":
            attributes["color"] =  "purple";
            break;
        case "controls-transport-of-chemical":
            attributes["color"] =  "cornflowerblue";
            break;
        case "chemical-affects":
            attributes["color"] =  "darkviolet";
            break;
        case "reacts-with":
            attributes["color"] =  "deepskyblue";
            break;
        case "used-to-produce":
            attributes["color"] =  "green";
            break;
        default:
            attributes["color"] =  'gray';
            break;
    }

    return attributes;
}
var sifStyleSheet = cytoscape.stylesheet()
        .selector('node')
        .css({
            'border-width':2,
            'border-color': 'gray',
            'background-color': 'white',
            'shape': 'roundrectangle',
            'text-halign':'center',
            'text-valign':'center',
            'width': function(ele){
                var spacing =(ele.data('id').length +2) * 10;
                return  Math.min(200,spacing);
            },
            'height':30,
            'content': 'data(id)'
        })
        .selector('edge')
        .css({
            'width': 3,
            'line-color': function(ele){
                return attributeMap(ele.data('edgeType')).color;

            },
            'line-style': function(ele){
                return attributeMap(ele.data('edgeType')).lineStyle;
            },
            'curve-style': 'bezier',

            'target-arrow-color': function(ele){
                return attributeMap(ele.data('edgeType')).color;
            },
            'target-arrow-shape': function(ele) {
                if (ele.data('edgeType') == "in-complex-with" || ele.data('edgeType') == "interacts-with" || //nondirected
                    ele.data('edgeType') == "neighbor-of" || ele.data('edgeType') == "reacts-with")
                    return 'none';
                return 'triangle';
            },
            'arrow-size':50,
            'opacity': 0.8
        })
        .selector(':selected')
        .css({
            'background-color': 'black',
            'line-color': 'black',
            'target-arrow-color': 'black',
            'source-arrow-color': 'black',
            'opacity': 1
        });

var sifContainer;

function loadBackboneViews(){

    var inputView = new InputView();
}

function convertSifToCytoscape(input){

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

    return {nodes: nodes, edges: edges};

}


var loadSifModel = function(input){

    var cyElements = convertSifToCytoscape(input);
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
        sifText: 'a controls b'
    },


    initialize : function() {
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
        loadSifModel($('#sifBox').val());
    },

    loadSifFile: function(e){

        var reader = new FileReader();

        reader.onload = function (e) {

            loadSifModel(this.result);
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
            autounselectify: true,


            layout: {
                animate: false,
                 fit: true,
                randomize: false,
                name: 'cose'

            },

            style: sifStyleSheet,

            elements: cyElements,

            ready: function () {

                cy.on('tapend', 'edge', function (e) {

                    console.log(cy.elements());
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


