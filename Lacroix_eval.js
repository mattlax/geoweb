var map = L.map('map', {
    minZoom: 10,
});
var osmUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, { attribution: osmAttrib }).addTo(map);

//////////////// affichage des iris, après conversion dans Qgis et modification de la colonne moyenne ////////////////
//////////////// palette de couleur méthode jenks ////////////////
/////////////////////////////////////////////////////////////////

function getColor(p) {
    return p > 12.1 ? '#800026' :
        p > 11.4 ? '#BD0026' :
            p > 10.7 ? '#E31A1C' :
                p > 9.9 ? '#FC4E2A' :
                    p > 8.9 ? '#FD8D3C' :
                        p > 7.7 ? '#FEB24C' :
                            p > 5 ? '#FED976' :
                                '#FFEDA0';
}

function stylepm25(feature) {
    return {
        fillColor: getColor(feature.properties.moyenne_pm25),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
////////////////////////////////////////////////////
//////////////// ajout de la couche ////////////////
/////////////////////////////////////////////////////

var commiris = L.geoJSON(pm25iris, {
    pointToLayer: function (feature, latlng) {
        return L.polygon(latlng, { icon: icon });
    },
    style: stylepm25,
    onEachFeature: mouse_events,
}).addTo(map);



/////////////////////////////////////////////////////
//////////////// mise en contour ////////////////////
/////////////////////////////////////////////////////

function mouse_events(feature, leaflet_object) {
    leaflet_object.on({
        mouseover: highstyle,
        mouseout: resetHighlight,
    });
}

function highstyle(event) {
    var iris = event.target;
    iris.bindTooltip(iris.feature.properties.NOM_IRIS);
    iris.setStyle({
        weight: 5,
        color: '#4298f4',
        dashArray: '',
        fillOpacity: 0.7
    });
    iris.bringToFront();
}

function resetHighlight(event) {
    commiris.resetStyle(event.target);
}

map.fitBounds(commiris.getBounds())

/////////////////////////////////////////////////////////////////////
////////// affichage des lignes de métro au dessus /////////////////
///////////////////////////////////////////////////////////////////

var metro = L.geoJSON(lignemetro, {
    pointToLayer: function (feature, latlng) {
        return L.polygon(latlng, { icon: icon });
    },
    style: myStyle
}).addTo(map);

// mise en style // 
function myStyle(feature) {
    return {
        color: 'blue',
        weight: 2,
        opacity: 1
    }
};

////////////////////////////////////////////////////////////
//////////////// affichage parking et cluster //////////////
///////////////////////////////////////////////////////////

var iconparking = L.icon({
    iconUrl: 'iconparking.png',
    iconSize: [15, 15],
    iconAnchor: [10, 10]
}
);

///on crée la variable parking mais on ne l'affiche pas.

var parking = L.geoJSON(parkings, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: iconparking });
    },
    onEachFeature:function (feature, layer) {
        layer.on('mouseover', function() {
            this.setStyle({fillColor: 'yellow', fillOpacity: 0.7})
            this.bringToFront()
            });
            
        layer.on('mouseout', function() {
            this.setStyle({fillOpacity: 0})
            });	
        }
})


var parking_buff = L.geoJSON(parkings, {
    pointToLayer: function (geoJsonPoint, latlng) {
		return 	L.circle(latlng, 300, {opacity:0.1 , fillOpacity: 0.1});
		},	
	onEachFeature:function (feature, layer) {
	layer.on('mouseover', function() {
		this.setStyle({fillColor: 'blue', fillOpacity: 0.7})
        this.bringToFront()
		});
		
	layer.on('mouseout', function() {
		this.setStyle({fillOpacity: 0})
		});	
	}
	}).addTo(map);

/////////////////////////////////////////////////////
/////////// Cluster pour les Parkings  //////////////
/////////////////////////////////////////////////////

var groupe_park = L.markerClusterGroup({disableClusteringAtZoom: 13});
map.addLayer(groupe_park);
parking.addTo(groupe_park);

////////////////////////////////////////////////
///////// création légende pm25 ////////////////
////////////////////////////////////////////////

function getColor2(d) {
    return d === '>12.1' ? '#800026' :
        d === '11.4 - 12.1' ? "#BD0026" :
            d === '10.7 - 11.4' ? "#E31A1C" :
                d === '9.9 - 10.7' ? "#FC4E2A" :
                    d === '8.9 - 9.9' ? "#FD8D3C" :
                        d === '7.7 - 8.9' ? "#FEB24C" :
                            d === '5 - 7.7' ? "#FED976" :
                                "#FFEDA0";
}

function style2(feature) {
    return {
        weight: 1.5,
        opacity: 1,
        fillOpacity: 1,
        radius: 6,
        fillColor: getColor2(feature.properties.TypeOfIssue),
        color: "grey"

    };
}
/////////////////////////////////////////////////////
/////////// création de la légende  /////////////////
/////////////////////////////////////////////////////

var legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Taux de particules Pm 2,5</strong>'],
        categories = ['>12.1', '11.4 - 12.1', '10.7 - 11.4', '9.9 - 10.7', '8.9 - 9.9', '7.7 - 8.9', '5 - 7.7'];

    for (var i = 0; i < categories.length; i++) {

        div.innerHTML +=
            labels.push(
                '<i class="circle" style="background:' + getColor2(categories[i]) + '"></i> ' +
                (categories[i] ? categories[i] : '+'));

    }
    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(map);


/////////////////////////////////////////////////////
//////////////// marqueur animé /////////////////////
/////////////////////////////////////////////////////

var mymetro = L.icon({
    iconUrl: 'iconmetro.png',
    iconSize: [35, 35],
    iconAnchor: [18, 18],
});

/////////////////////////////////////////////////////
//////////////// Ligne B ////////////////////////////
/////////////////////////////////////////////////////

var pathmetroB = L.polyline([
    [45.770440530029369, 4.863175968935646],
    [45.769335574179642, 4.860986433228422],
    [45.768730130074495, 4.859864381743018],
    [45.765087933080714, 4.859568588977855],
    [45.763906698966146, 4.859586659488099],
    [45.76283499003921, 4.859593988842484],
    [45.76255272614133, 4.859508155715419],
    [45.762325256756263, 4.859350060310241],
    [45.762128542989018, 4.859176006334061],
    [45.761904308164326, 4.858753620284099],
    [45.761720705446194, 4.858266509719602],
    [45.761590679215821, 4.857318606533473],
    [45.76146756964836, 4.856062192234374],
    [45.761296269044621, 4.854062382511827],
    [45.761070511726288, 4.851528553997251],
    [45.760813100039947, 4.849971771813236],
    [45.760458742066177, 4.8488281481846],
    [45.759861460597605, 4.848091016713578],
    [45.75934990080323, 4.847441323659069],
    [45.758943166685562, 4.846946858587335],
    [45.758628856748501, 4.84657024978593],
    [45.758122387981359, 4.846132653461581],
    [45.757597765179106, 4.846066969546346],
    [45.756997966111996, 4.846191853337133],
    [45.756291332963073, 4.846375784289867],
    [45.755834756481534, 4.846493917241301],
    [45.755321899323455, 4.846639257467759],
    [45.754564855881341, 4.846860375080007],
    [45.753867051006473, 4.847006297414749],
    [45.753660310670412, 4.846922233070471],
    [45.753312523757629, 4.846714881241645],
    [45.724134924981534, 4.829329241168998],
    [45.72339155028979, 4.828810953674271],
    [45.722365152313259, 4.828186692823754],
    [45.721718914011745, 4.827688230249003],
    [45.721077649771779, 4.826965602078253],
    [45.719911116424946, 4.825444039243276],
    [45.718970589474331, 4.824039850283319],
    [45.718113638522375, 4.822409990150962],
    [45.7177200642207, 4.821147874244752],
    [45.717491086838614, 4.820082943035018],
    [45.716919560332315, 4.816318033610654],
    [45.716758078694916, 4.815219430849116],

]);

var lmetroB = L.GlAnimatedMarker(pathmetroB.getLatLngs(), { icon: mymetro, speed: 200 });
map.addLayer(lmetroB);

/////////////////////////////////////////////////////
//////////////// Ligne D ////////////////////////////
///// j'ai tenté de créer un js avec ces coordonnées mais ça n'a pas marché.../////
/////////////////////////////////////////////////////

var pathmetroD = L.polyline([
    [45.780688361273128, 4.804447723294087],
    [45.780169898010811, 4.803974771076777],
    [45.77952831636285, 4.803367367112594],
    [45.779170157210011, 4.803138576091174],
    [45.778803621794111, 4.803020029016412],
    [45.77839878438192, 4.803018893545881],
    [45.777991147239035, 4.803145264946796],
    [45.777731274953155, 4.803320805634772],
    [45.777513039814572, 4.80349821212362],
    [45.777212064310774, 4.803918660507509],
    [45.777063335251079, 4.804184269879132],
    [45.776834667581277, 4.804565412477756],
    [45.7766569451774, 4.804795681227801],
    [45.776434830064801, 4.805006638894175],
    [45.776286456686734, 4.805127910559234],
    [45.776142210573902, 4.805189504444986],
    [45.775949632478373, 4.80528296426884],
    [45.775704456366981, 4.805331520006585],
    [45.775436049837118, 4.805353508069806],
    [45.774703513336121, 4.805363171247317],
    [45.774019307429342, 4.805340970283384],
    [45.773436965775936, 4.805289309069706],
    [45.773062076120922, 4.805296039247794],
    [45.772113710886678, 4.80535754060711],
    [45.771666116379237, 4.805405516033163],
    [45.771242501293685, 4.805446058798565],
    [45.770794720586196, 4.805502532287227],
    [45.769692288237735, 4.80554663687272],
    [45.769221463047081, 4.805568042827622],
    [45.768977595822207, 4.80555709685589],
    [45.768764029247869, 4.805521989796258],
    [45.768201774537026, 4.805369145043948],
    [45.767993782032605, 4.805351302705766],
    [45.767839320365695, 4.805335862462654],
    [45.767374070422463, 4.805374535833963],
    [45.766472748296927, 4.805478708067572],
    [45.766126270107705, 4.805531213697621],
    [45.76596436611041, 4.805583498342084],
    [45.76572940576601, 4.8057090648525],
    [45.765571954296263, 4.805829603492261],
    [45.765419329564672, 4.806001399103838],
    [45.765283987815856, 4.806199491098717],
    [45.76519028139122, 4.806399449792763],
    [45.765062534913717, 4.806793539809585],
    [45.764198715872105, 4.809791675155175],
    [45.763515415122676, 4.812159843551584],
    [45.762728269358398, 4.814914578574291],
    [45.761657746080886, 4.818634697998577],
    [45.761449749230955, 4.819424915411272],
    [45.761338672783396, 4.819870740303635],
    [45.761232978297635, 4.820342326183392],
    [45.761060068831668, 4.821133932391566],
    [45.760835783335885, 4.822416945806187],
    [45.760645818438554, 4.823666965897113],
    [45.760505532213131, 4.82460164947549],
    [45.760412593640154, 4.825241921897638],
    [45.760320574937204, 4.825876007622378],
    [45.760189119652658, 4.826781367494967],
    [45.76010909166007, 4.82726667514069],
    [45.760093060101482, 4.827383678909805],
    [45.760002525579552, 4.828044420344017],
    [45.75991332019337, 4.828576269704592],
    [45.759777851022747, 4.82904647936533],
    [45.759593852108758, 4.829557018890759],
    [45.759368969711957, 4.830031676110493],
    [45.759208910632644, 4.830301431207154],
    [45.758795565918696, 4.830998047760516],
    [45.75845970091077, 4.831564074424428],
    [45.757959033653918, 4.832391959993645],
    [45.757848380832655, 4.832548551619015],
    [45.757713748372765, 4.832712560633685],
    [45.757561083340399, 4.832884258328879],
    [45.757219875965681, 4.833234526729528],
    [45.756798509665479, 4.833708737486537],
    [45.756505826636442, 4.834018670632613],
    [45.756302740714879, 4.834315655462191],
    [45.756041206089868, 4.834831129433443],
    [45.755912035953003, 4.83528456754784],
    [45.755798627549204, 4.835832278461397],
    [45.75576981050483, 4.836324293827345],
    [45.755788006291723, 4.836843960236084],
    [45.755967410378453, 4.838144966007536],
    [45.756021096862177, 4.838674754632869],
    [45.756086865492115, 4.839196588676371],
    [45.756111869121334, 4.839410367052731],
    [45.756141114697591, 4.839700889402158],
    [45.756153273973432, 4.83995661191576],
    [45.756159484604545, 4.840212064036468],
    [45.756135008107734, 4.840508647319111],
    [45.75609863430374, 4.840804688917604],
    [45.756044986754198, 4.841074427844617],
    [45.755966597459306, 4.841385567428094],
    [45.755152158705414, 4.843730030182466],
    [45.753706270374785, 4.847950813053925],
    [45.752802144996153, 4.850571662268396],
    [45.751700242758631, 4.853778730477702],
    [45.750936561626681, 4.855972077736677],
    [45.74935019276311, 4.860594014976332],
    [45.748611699595038, 4.862720297609465],
    [45.747732363666465, 4.8652822829183],
    [45.745305062560774, 4.872322665464215],
    [45.745024931689798, 4.873126144705459],
    [45.743591183110716, 4.877286459280197],
    [45.74317938027307, 4.878381441831165],
    [45.742931640230651, 4.879067303753942],
    [45.742734749638082, 4.879610948892537],
    [45.742668919508318, 4.879888528315316],
    [45.742543975205699, 4.880409982371446],
    [45.74246374511668, 4.880797441923158],
    [45.742399815492455, 4.881253684577893],
    [45.742308624716365, 4.881861730837501],
    [45.742239321557818, 4.882292210708178],
    [45.742184994893108, 4.882587325245298],
    [45.742099966434793, 4.882923535910067],
    [45.74199114413824, 4.883258645240296],
    [45.741834354170663, 4.883608539941784],
    [45.741673542638182, 4.88387321057394],
    [45.741348091384751, 4.884308832401302],
    [45.74110458945195, 4.884544159564704],
    [45.740856296020183, 4.884728244129341],
    [45.740077269950724, 4.885210875693844],
    [45.739720371556807, 4.88545794922789],
    [45.739629419661803, 4.885530266303227],
    [45.739532132881969, 4.885619294737767],
    [45.739282873214449, 4.885845839970943],
    [45.738759209995038, 4.886357280506593],
    [45.737547810222125, 4.887525579059471],
    [45.736975399822612, 4.888085744216119],
    [45.736773330025279, 4.888331460395786],
    [45.736399894382856, 4.888781799322462],
    [45.736264987600556, 4.88895409978721],
    [45.736081918740012, 4.889149674702653],
    [45.735906148745123, 4.889286070403845],
    [45.735815195026127, 4.889358374902722],
    [45.735652672638679, 4.889435862680817],
    [45.735460606215362, 4.889503477973946],
    [45.735083297572814, 4.889563102752626],
    [45.734957600818348, 4.88957121274299],
    [45.734747421534067, 4.889553497965593],
    [45.734542190444287, 4.889502156552148],
    [45.734294995198347, 4.889395098929863],
    [45.733886489620687, 4.889145140007105],
    [45.73330592487433, 4.888795601936798],
    [45.733001258441476, 4.888640080204937],
    [45.73275406201811, 4.888533029769128],
    [45.732207490905864, 4.888344393440932],
    [45.731793709191024, 4.888203735233746],
    [45.731554020652062, 4.888073139954378],
    [45.731367361564253, 4.887941021132302],
    [45.73074115511784, 4.88745199086804],
    [45.730087309656575, 4.886951734357653],
    [45.729847755510569, 4.886815181451338],
    [45.729669490871935, 4.886743200345915],
    [45.729555616538867, 4.886721993817002],
    [45.729392620683996, 4.886714442578735],
    [45.728744193664141, 4.886768048644993],
    [45.724310034661727, 4.887175890970513],
    [45.723820906306912, 4.887220927108964],
    [45.723730218877748, 4.887222697688376],
    [45.723328910796972, 4.887208086590288],
    [45.722863701149414, 4.887182551080028],
    [45.72265819873828, 4.887143163548094],
    [45.722079049403277, 4.886915235807685],
    [45.721866318691475, 4.886825738452526],
    [45.721703224513611, 4.886781884496988],
    [45.721502391399142, 4.886781005944661],
    [45.721355190839688, 4.886803304824944],
    [45.721169615267797, 4.886857426524204],
    [45.720983682224549, 4.886927210350392],
    [45.720482152619674, 4.887145880951812],
    [45.719351001124345, 4.887627674388157],
    [45.718988028956076, 4.887790039485871],
    [45.718861759107838, 4.887823384949195],
    [45.718725931900074, 4.887843484753685],
    [45.718372490855891, 4.887847749056339],
    [45.717480209920851, 4.887863515387897],
    [45.716950998459346, 4.887871734972738],
    [45.716455598782574, 4.88792527456368],
    [45.715369058055309, 4.888053416544007],
    [45.714802228504396, 4.88810058977452],
    [45.71422766877528, 4.888148407995414],
    [45.713800559205289, 4.888167715485796],
    [45.713389972446535, 4.888157189027307],
    [45.713216506431166, 4.888148579573626],
    [45.712886121590763, 4.888119831687914],
    [45.712327177843854, 4.888034582465763],
    [45.711937751650623, 4.887945994205699],
    [45.71106969863385, 4.887724374435209],
    [45.710687527549048, 4.887627166839996],
    [45.710087641589645, 4.88747956375735],
    [45.709640607796722, 4.887371517988257],
    [45.709094286016629, 4.887235761887564],
    [45.708856294778627, 4.887192984113717],
    [45.70867830942521, 4.887189219274382],
    [45.708518928644175, 4.887195272122757],
    [45.708370264257482, 4.887213019239515],
    [45.708150991249852, 4.887265565293734],
    [45.708008905710741, 4.887312962204757],
    [45.707903326664123, 4.887359341324567],
    [45.707750064966127, 4.887436944985323],
    [45.707309162047906, 4.887684514389433],
    [45.706991323164388, 4.887865672242895],
    [45.706779738213328, 4.887952877097393],
    [45.70668133090161, 4.887972290589],
    [45.706557681177848, 4.887990466202172],
    [45.706457210204427, 4.887997420060771],
    [45.705637585701126, 4.888004184374848],

]);

var lmetroD = L.GlAnimatedMarker(pathmetroD.getLatLngs(), { icon: mymetro, speed: 200 });
map.addLayer(lmetroD);


/////////////////////////////////////////////////////
////////// panneau de contrôle des couches //////////
/////////////////////////////////////////////////////

var mixed = {
    "Pollution Iris": commiris,           // BaseMaps
    "Ligne de métro": metro, 		     // BaseMaps
    "Parkings": groupe_park,			// BaseMaps
    "Buffer 300m" : parking_buff,      // BaseMaps
    "Métro Ligne B " : lmetroB,       // BaseMaps
    "Métro Ligne D" : lmetroD,       // BaseMaps

};

L.control.layers(null, mixed).addTo(map);


/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/*

(\_/)               ///////  ///   //  //
( •,•)             /////    ///   /// //
(")_(")           //       ///   /  ///

*/

