function debounce(func) {
    "use strict";
    return function(t, e, n) {
        var r, i, o;
        return function() {
            clearTimeout(r), i = n || this, o = arguments, r = setTimeout(function() {
                t.apply(i, o), i = o = null
            }, e)
        }
    }
}


function mapData(data) {


    var paletteScale = d3.scale.linear()
                .domain([0,data.length])
                .range(["#f0f7da","#234d20"]); // blue color

    var data_table = [];

    var tickFormat = {
        allowEmpty:true,
        allowTruthy:true,
        //tickElement:"<i class='fa fa-check'></i>",
        crossElement:'<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve"><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"></path></svg>*'
    };

    var data_tableheader = [{title:"Name", field:"name", width:150, frozen:true}, {title:"EU", field:"eu", align:"center", formatter:"tickCross", formatterParams: tickFormat}];

    var countryCodes = Object.keys(countries);
    
    var data_map_base = [];
    var eu_3 = [];
    for (i = 0; i < countryCodes.length; i++) {

        var eu = true;
        var code3 = countryCodes[i];
        var code2 = countries[code3].a2;
        var note = notes[code2];
        if (ROAM.indexOf(code2) === -1) 
            eu = undefined;
        
        if (note !== undefined) {
            eu = false;
            console.log("we have a note");
        }

        data_map_base[code3] = {operators: "", operatorsCount: 0, eu: eu, note: note};
        if (eu !== undefined)  {
            data_map_base[code3].fillColor = "#003399";
            eu_3.push(code3);
        }
            
        data_table[code3] = {name: countries[code3].name, eu: eu, phone: countries[code3].phone};
    }


    for (i = 0; i < data.length; i++) {
        if (data[i].freeRoamEU)
            Array.prototype.push.apply(data[i].freeRoam,eu_3);

        for (j = 0; j < data[i].freeRoam.length; j++) {            
            data_table[data[i].freeRoam[j]][i] = true;
        }

        data_tableheader.push({
            title: data[i].operator + " (" + data[i].plan + ")", 
            field: ""+i, 
            align:"center",
            formatter:"tickCross", formatterParams:tickFormat});
    }
    
    data_tableheader.push({
        title: "Landekode", 
        field: "phone", 
        align:"right"});

    this.$container = $("#container");

    this.selected = undefined;
    this.init = function(selected) {

        this.selected = selected;



        this.sizeRatio = 16.0/9.0;
        this.width = this.$container.width();
        this.height = this.width / this.sizeRatio;
        this.$container.css({
            paddingTop: 0,
            height: this.height
        });
        var data_map = $.extend(true, [], data_map_base);

        for (i = 0; i < data.length; i++) {

            if (selected !== undefined && selected !== data[i].operator + " (" + data[i].plan + ")") {
                continue;
            }

            for (j = 0; j < data[i].freeRoam.length; j++) {
    
                if (data_map[data[i].freeRoam[j]].operators != "") 
                    data_map[data[i].freeRoam[j]].operators += ", ";
                    
                data_map[data[i].freeRoam[j]].operators += data[i].operator + " (" + data[i].plan + ")";
                data_map[data[i].freeRoam[j]].operatorsCount++;
    
                if (!data_map[data[i].freeRoam[j]].eu) 
                    data_map[data[i].freeRoam[j]].fillColor = paletteScale(data_map[data[i].freeRoam[j]].operatorsCount);
                
            }
    
        }

        this.instance = new Datamaps({
            scope: 'world',
            element: this.$container.get(0),
            projection: 'mercator',
            done: this._handleMapReady.bind(this),  
            fills: {
                defaultFill: "#d3d3d3",
            },
            data: data_map,
            geographyConfig: {
                popupTemplate: function(geography, data) { //this function should just return a string
                    var popup = '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong>';

                    if (data.eu !== undefined)
                        popup += "<br>EU Roaming";

                    if (data.note !== undefined)
                        popup += "<br>" + data.note;

                    if (data.operators !== "") 
                        popup += '<br>' + data.operators;
                        
                    return popup +  '</div>';
                },
                popupOnHover: true, //disable the popup while hovering
                highlightOnHover: true,
                borderWidth: 0.1,
                highlightFillColor: '#FC8D59',
                highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
            },
        });
    }

    this.reinit = function() {
        this.$container.empty();
        this.init(this.selected);
    }
    var self = this;
    

    

    window.addEventListener('resize', function() {
        self.reinit();
    });

    var $dropdown = $("#filter");
    $dropdown.append($("<option />").val("").text("Alle"));

    $.each(data, function() {
        $dropdown.append($("<option />").val(this.operator + " (" + this.plan + ")").text(this.operator + " (" + this.plan + ")"));
    });

    $dropdown.change(function(){
        var result = $(this).val();
        if (result === "")
            result = undefined;

        if (self.selected !== result) {
            self.$container.empty();
            self.init(result);
        };   
    });
    
    this.init();

    //create Tabulator on DOM element with id "example-table"
    var table = new Tabulator("#table", {
        height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        data:Object.values(data_table), //assign data to table
        laymapData:"fitColumns", //fit columns to width of table (optional)
        columns:data_tableheader,
        rowClick:function(e, row){ //trigger an alert message when the row is clicked
            alert("Row " + row.getData().name + " Clicked!!!!");
        },
    });
}

mapData.prototype._handleMapReady = function(datamap) {
    this.zoom = new Zoom({
      $container: this.$container,
      datamap: datamap
  });
}