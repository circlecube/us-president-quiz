if (!window.console) console = {log: function() {}};

jQuery( function( $ ) {
	
	var time = new Date();
	var presidents;//array to hold all president objects with data in this format:
	/*
		id: 233,
		date: "2015-03-18T17:34:51",
		date_gmt: "2015-03-18T17:34:51",
		modified: "2016-01-21T14:39:58",
		modified_gmt: "2016-01-21T14:39:58",
		slug: "george-washington",
		type: "president",
		link: "https://app.circlecube.com/uspresidents/president/george-washington/",
		title: {
		rendered: "George Washington"
		},
		featured_image: 39,
		acf: {
		first_name: "George",
		last_name: "Washington",
		number: "1",
		terms: [
		{
		term_number: "1"
		},
		{
		term_number: "2"
		}
		],
		portrait: [
		{
		url: "https://app.circlecube.com/uspresidents/wp-content/uploads/sites/3/2015/03/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg",
		width: 501,
		height: 600,
		},...
		}
		],
		birthdate: "17320222",
		took_office: "17890430",
		left_office: "17970304",
		death_date: "17991214",
		party: "Independent",
		vice_president: "John Adams",
		previous_office: "Commander-in-Chief of the Continental Army (1775–1783)",
		birthplace: "Westmoreland, Virginia",
		notes: ""
		},
		},
	*/
	$('.start').html('getting data ' + timer(time) );

	//load data from api url
	//https://app.circlecube.com/uspresidents/wp-json/wp/v2/president?filter[posts_per_page]=-1

	$.ajax({
	  url: 'https://app.circlecube.com/uspresidents/wp-json/wp/v2/president?filter[posts_per_page]=-1&filter[order]=ASC&filter[orderby]=meta_value_num&filter[meta_key]=took_office',
	  cache: false,
	  error: function ( jqXHR, textStatus, errorThrown ) {
	  	$('.start').html('error getting data');
	  },
	  success: function ( data ) {
	  	$('.start').html('processing data ' + timer(time));
	    //send json respons to setup
	    setup(data);
	  },
	});


	function setup(presidents){
		$('#page_content').append('<section class="presidents"><h1>US Presidents</h1></section>');
		for (var i = 0; i < presidents.length;i++){
			// console.log(presidents[i].title);
			var president = '<h2>' + presidents[i].title.rendered + '</h2>';
			var start, end;
			start = stringtodate(presidents[i].acf.took_office);
			end = stringtodate(presidents[i].acf.left_office);
				
			president += '<h3>' + start.getFullYear() + ' - ' + end.getFullYear() + '</h3>';
			president += '<img src="' + presidents[i].acf.portrait[0].sizes.medium + '" />';
			$('.presidents').append('<article class="president">' + president + '</article>');
		}
		$('.start').html('ready to go ' + timer(time));
	}

	function stringtodate(string){
		if ( string === 'now' || !string ) {
			return new Date();
		}
		return new Date(
				string.substring(0,4),
				string.substring(4,5),
				string.substring(6,7)
		);
	}

	function timer(time){
		var now = new Date();
		console.log( (now-time)/1000 + 's' );
		return (now-time)/1000 + 's';
	}

});

$(document).foundation();