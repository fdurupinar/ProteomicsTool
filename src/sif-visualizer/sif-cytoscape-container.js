/**
 * Created by durupina on 8/31/16.
 */


function loadBackboneViews(){

    // var inputModel = new InputModel({sifBoxValue:$('#sifBox').value});
    // inputModel.set('sifBoxValue', 'a controls b');
    //
    // //inputModel.on('change:sifBoxValue', readCytoscapeElements(inputModel.get('sifBoxValue')), this);


    var inputView = new InputView();


}

function readCytoscapeElements(input){
    var cyElements;



    var interactions = SIFJS.parse(input);


    var nodes = [];
    interactions.nodes.forEach(function (node) {
        var node = {data:{id:node.id}};
        nodes.push(node);

    });

    var edges = [];
    interactions.links.forEach(function(link){
        var edge = {data:{id: (link.source + "_" + link.target), source: link.source, target: link.target }};
        edges.push(edge);
    });

    //if(edges.length>0)
        cyElements = {nodes: nodes, edges: edges};
   // else
     //   cyElements = [{nodes: nodes}];

    return cyElements;

}


var loadSifModel = function(input){

    var cyElements = readCytoscapeElements(input);
    new SifContainer({ model: cyElements}).render();
}

// var InputModel = Backbone.Model.extend({
//     defaults: {
//         sifBoxValue: ''
//     },
//
//
// })

var InputView = Backbone.View.extend({
    el: '#input-container',

    tagName: 'textarea',

    events: {
        "click #sifSubmitButton" : "getSifData",
    },



    initialize : function() {
        this.render();
    },
    render: function(){

        // pass variables in using Underscore.js template
        var variables = {
            sifText: 'a controls b'
        };


        // compile the template using underscore
        var template = _.template( $("#input-loading-template").html());
       template = template(variables);

//        console.log(template.sifText);

        // load the compiled HTML into the Backbone "el"

        $(this.el).html(template);

        return this;
    },

    getSifData: function(e) {
        loadSifModel($('#sifBox').val());

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

        try {
            var cy = window.cy = cytoscape({
                container: this.el,

                boxSelectionEnabled: false,
                autounselectify: true,


                layout: {
                    animate: false,
                    fit: false,
                    randomize: false,
                    name: 'cose'

                },

                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#ad1a66',
                            'label': 'data(id)'
                        }
                    },

                    {
                        selector: 'edge',
                        style: {
                            'width': 3,
                            'line-color': '#ad1a66'
                        }
                    }
                ],

                elements: cyElements

            });
        }
        catch(e){
            console.log(e);

        }

        return this;
    }
});