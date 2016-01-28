if (!window.console) console = {log: function() {}};

jQuery(document).ready(function($) {
	
	var start_time = new Date();
	var end_time = new Date();
	var seconds = 0; // (start_time - end_time)/-1000;
	var delay_time = 900;

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
	var gaPlugin;
	var completed = [];
	var num_total = 0;
	var num_correct = 0;
	var num_incorrect = 0;
	var score_percent = 0;
	var level = 0;
	var mode = 'learn';// learn/test
	var levels = [
	    ['face'],
	    // ['term'],
	    // ['party'],
	    // ['birthday'],
	    // ['bio'],
	    // ['hometown'],
	    // ['Vice President'],
	    // ['Previous Office']

	];
	var free_version = false;

	var perfect = ['Perfect!', 'Flawless!', 'Amazing!', 'On a Roll!', 'Impeccable!', 'Unblemished!'];
	var kudos =  ['Great!', 'Awesome!', 'Well done,', 'You\'re Smart,', 'Crazy Good!', 'Feelin\' it!', 'Dynamite!', 'Gold Star!', 'Impressive!', 'Exactly!', 'Correct!', 'Bingo!', 'On the nose!', 'Right!', 'Right on!', 'Righteous!', '', 'Inspiring!', 'Precisely!', 'Exactly!', 'Right as Rain!', ''];
	var banter = ['Ouch!', 'Doh!', 'Fail!', 'Focus, only', 'Finger Slip?', 'Don\'t Give Up!', 'Good Grief!', 'Embarrasing!', 'Wrong!', 'Miss!', 'Incorrect!', 'You Blew It!', 'Nope!', 'You Must Be Joking!', 'Woah!', 'Need Help?', 'Try Studying,', 'Incorrect!', 'False!', 'Make sure to keep your eyes open.', 'Try Again,', 'Nice try, '];
	var active_team = presidents;
	var active_team_title = 'Presidents';
	var list_player;
	var list_player_template;
	var rosters = [ ['All', 0] ];
	var roster = 'All';

	//setup handlebars
	// list_player = $("#list_player").html();
	// list_player_template = Handlebars.compile(list_player);

	//run init
	init();

	function init(){
		//add event listeners
		document.addEventListener("deviceready", onDeviceReady, false);
		document.addEventListener("menubutton", onMenuKeyDown, false);
		document.addEventListener("backbutton", onBackKeyDown, false);

		//output loading message
		console.log('getting data ' + timer(start_time) );

		// load data from api from the following url:
		/* https://app.circlecube.com/uspresidents/wp-json/wp/v2/president?
			filter[posts_per_page]=-1&
			filter[order]=DESC&
			filter[orderby]=meta_value_num&
			filter[meta_key]=took_office
		*/
		$.ajax({
		  url: 'https://app.circlecube.com/uspresidents/wp-json/wp/v2/president?filter[posts_per_page]=-1&filter[order]=DESC&filter[orderby]=meta_value_num&filter[meta_key]=took_office',
		  cache: false,
		  error: function ( jqXHR, textStatus, errorThrown ) {
		  	console.log('error getting data');
		  },
		  success: function ( data ) {
		  	console.log('processing data ' + timer(start_time));
		    //send json response to setup function
		    setup(data);
		  },
		});

		//load settings from localStorage
	}

	//once json received, process date and then start game
	function setup(json){
		console.log('ready to go ' + timer(start_time));

		presidents = json;

		active_team = presidents;

		build_rosters();
		
		update_roster();

		//calculate ordinals
		set_ordinals();

		//calculate ages of people
		set_ages();

		//begin game
		game_on();
	}

	function set_ordinals(){
		// console.log('initial order',active_team);
		//sort by took_office and number them
		active_team.sort(function(a, b) {
		    return parseInt( a.acf.took_office ) - parseInt( b.acf.took_office );
		});

		// console.log('sorted',active_team);

		//add ordinal 
		for ( var i = 0; i < active_team.length; i++){
			active_team[i].acf.ordinal = ordinal_suffix(i+1);
		}
	}

	function ordinal_suffix(i) {
	    var j = i % 10,
	        k = i % 100;
	    if (j == 1 && k != 11) {
	        return i + "st";
	    }
	    if (j == 2 && k != 12) {
	        return i + "nd";
	    }
	    if (j == 3 && k != 13) {
	        return i + "rd";
	    }
	    return i + "th";
	}

	function set_ages(){
		for ( var i = 0; i < active_team.length; i++){
			active_team[i].age = get_age(active_team[i].acf.birthdate, active_team[i].acf.death_date);
			// console.log(active_team[i].title.rendered, active_team[i].age);
		}
	}

	function get_age(start, end) {
		end = typeof end !== 'undefined' || end !== '' ? stringtodate(end) : new Date();
	    var start = stringtodate(start);
	    var age = end.getFullYear() - start.getFullYear();
	    var m = end.getMonth() - start.getMonth();
	    if (m < 0 || (m === 0 && end.getDate() < start.getDate())) {
	        age--;
	    }
	    return age;
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

	function onDeviceReady() {
		//https://github.com/phonegap-build/GAPlugin/blob/c928e353feb1eb75ca3979b129b10b216a27ad59/README.md
		//gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Button", "Click", "event only", 1);
	    gaPlugin = window.plugins.gaPlugin;
	    gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-1466312-13", 10);

		gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "App", "Begin");
	}
	

	function onMenuKeyDown() {
	    // Handle the menu button
	    $('.menu-icon').trigger('click');
	}

	function onBackKeyDown() {
	    // Handle the back button
	    // do nothing
	}


	function build_rosters(){
		console.log('build rosters');
		//get rosters from data and build master
		for ( var i = 0; i < active_team.length; i++ ){
			active_team[i].rosters = ''; //initialize rosters value since there is none yet
			active_team[i].rosters += ',All';
			var player_rosters_string = active_team[i].rosters;			
			var player_rosters = player_rosters_string.split(',');
			for ( var j = 0; j < player_rosters.length; j++ ) {
				//if not in rosters already
				if ( player_rosters[j] !== '' ) {
					var main_roster_index = -1;
					for( var k = 0; k < rosters.length; k++){
						//match
						if( player_rosters[j] == rosters[k][0] ) {
							main_roster_index = k;
							//increment count
							rosters[k][1]++;
						}
					}
					if ( main_roster_index === -1 ) {
						//add to master rosters list
						// console.log('adding new roster', player_rosters[j]);
						var new_roster = [player_rosters[j], 1];
						rosters.push( new_roster );
					}
				}
			}
		}
		
		// console.log(rosters);
		
		//sort alphabetically
		rosters.sort(function(a, b) {
		    return parseInt( b[0].substring(0, 4) ) - parseInt( a[0].substring(0,4) );
		});
		
		// console.log(rosters);
		
		//build menu item for each roster
		var rosters_html = '';
		for (var i = 0; i < rosters.length; i++){
			//only show near full squads - at least 20 men
			if (rosters[i][1] >= 20 ) {
				rosters_html += '<li><a href="#" class="quiz quiz_roster" data-index="'+i+'" data-value="' + rosters[i][0] + '" data-count="' + rosters[i][1] + '">' + rosters[i][0] + '</a></li>';
			}
		}
		$('.quiz_roster ul').html(rosters_html);
	}

	function update_roster() {
		console.log('update rosters');
		//filter out any players without a specific value
		//these will automatically be added to the build as images are added
		
		console.log(levels[level][0]);
		
		switch(levels[level][0]) {
		    /*case 'stats':
				active_team = $.grep( presidents, function( player, i ) {
				  return 	player.img != null && 
				  			player.caps != null && 
				  			player.pos != '' && 
				  			player.rosters.indexOf( roster ) > -1;
		  		});
	  		break;	
			
			case 'club':
				active_team = $.grep( presidents, function( player, i ) {
				  return 	player.img != null && 
				  			player.club != null && 
				  			player.club != '' && 
				  			player.rosters.indexOf( roster ) > -1;
		  		});
	  		break;
		
			case 'hometown':
				active_team = $.grep( presidents, function( player, i ) {
				  return 	player.img != null && 
				  			player.hometown != null && 
				  			player.hometown != '' && 
				  			player.rosters.indexOf( roster ) > -1;
				});
				break;
			*/
			default:  //face / default
				//filter out any without an image
				active_team = $.grep( presidents, function( player, i ) {
				  return 	player.acf.portrait != null && 
				  			player.rosters.indexOf( roster ) > -1;
				});
			
		}
	}




	function game_on(){
		console.log('game on');
		$('.footer').html('');
		completed = [];
		num_total = 0;
		num_correct = 0;
		num_incorrect = 0;
		score_percent = 0;
		new_question();
	}
	function new_question(){
		console.log('new_question');
	    
	    make_question(active_team, get_random_groupindex(active_team));

	}
	function make_question(group, answer_index){
		console.log('make_question', group, answer_index);
	    //get mc answers
	    var mc_answers = get_random_mc_answers(group, answer_index);
	    var question_html = '';
	    var answers_html = '';
	    //console.log(levels[level][0]);
	    switch(levels[level][0]) {
	        
	        default: //face
	            question_html = '<h1 data-answer="' + group[answer_index].title.rendered + '" class="question">';
	            question_html += group[answer_index].title.rendered;
	            question_html += ' (' + group[answer_index].acf.ordinal + ')';
	            question_html += '</h1>';
	            for (var i = 0; i < 4; i++){
	            	answers_html += get_answer_div(group,mc_answers,i,2);
	            }
	          //error
	    }
	    $('.header').html(question_html);
	    $('.content').html(answers_html);
	    

	    var correct = $.inArray(answer_index, mc_answers);
	    // $('.answer_'+correct).addClass('correct');
	    $('.answer').each(function(idx, ele){
	    	// console.log( $(this).data('answer'), $('.question').data('answer') );
	    	if ( $(this).data('answer') == $('.question').data('answer') ) {
	    		$(this).addClass('correct');
		    }
	    });
	}
	function get_answer_div(group, mc_answers, index, img){
	    var answer_div = "";
	    switch(levels[level][0]) {

	        default: //face
	            answer_html =  '<article data-answer="' + group[mc_answers[index]].title.rendered + '"';
	            answer_html += ' class="answer answer_' + index + '"';
	            answer_html += ' data-id="' + mc_answers[index] + '"';
	            answer_html += ' data-level="' + levels[level][0] + '"';
	            answer_html += ' style="background-image: url(' + group[mc_answers[index]].acf.portrait[0].sizes.medium + ');"';
	            answer_html += ' data-alt="' + group[mc_answers[index]].title.rendered + '">';
	            answer_html += '</article>';
	          //error
	    }
	    return answer_html;
	}

	function get_random_mc_answers(group, correct){
	    var generated = [];
	    generated.push(correct);
	    for (var i = 1; i < 4; i++) {
	        while(true){
	            var next = Math.floor(Math.random()*group.length);
	            if (0 > $.inArray(next, generated)) {
	                // Done for this iteration
	                generated.push(next);
	                break;
	            }
	        }
	    }
	    randomize(generated);
	    return generated;
	}
	function get_random_groupindex(group){
		// console.log('get_random_groupindex');
	    var random_index = Math.floor(Math.random()*group.length);
		// console.log(completed);
	    //console.log(completed.toString(), random_index, $.inArray(random_index, completed));
	    if ( $.inArray(random_index, completed) < 0 ){
	        //console.log('unique found');
	        return random_index;
	    }
	    else if( completed.length == group.length ){
	        completed = [];
	        return random_index;
	    }
	    else{
	        //console.log('repeat found');
	        return get_random_groupindex(group);
	    }
	}
	function get_random_index(group){
	    var random_index = Math.floor(Math.random()*group.length);
	    return random_index;
	}
	function randomize(myArray) {
	  var i = myArray.length, j, tempi, tempj;
	  if ( i == 0 ) return false;
	  while ( --i ) {
	     j = Math.floor( Math.random() * ( i + 1 ) );
	     tempi = myArray[i];
	     tempj = myArray[j];
	     myArray[i] = tempj;
	     myArray[j] = tempi;
	   }
	}


	$('.content').on('click', '.answer', function(e){
		//console.log('clicked',$(this).attr('data-id'));
		if ( !$(this).hasClass('list') ) {

			// LEARN MODE
			if (mode == 'learn' ){
				
			    $(this).addClass('clicked');
			    var is_correct = false;
			        // end_time = new Date();
			        // time = start_time - end_time;

			    if ( $(this).hasClass('correct') ){
			        is_correct = true;
			        //calculate total clicked answers for this question
			        var num_clicked = $('.clicked').length;

			        if ( num_clicked == 1 ){
			        	completed.push( parseInt($(this).attr('data-id')) );
			            num_correct++;
			        }
			    }
			    
			    // if( $(this).data('alt') != undefined ) {
			    //     $(this).prepend( '<p class="label">' + $(this).data('alt') +'</p>' );
			    // }

			        // end_time = new Date();
			        // seconds = Math.floor( (start_time - end_time ) / -1000);
			        // var correct_per_minute = Math.round( (num_correct / seconds ) * 60 );
			    //console.log( correct_per_minute );
			    //update score + feedback
			    $('.footer').html('');

			    //if round complete
			    //console.log(is_correct, num_correct, active_team.length, num_total);
			    if( is_correct && num_correct == active_team.length ) {
			        if (gaPlugin) {
			        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt') );
			        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Round", "End", levels[level][0] + ' ' + mode, parseInt(num_correct / (num_total+1)*100 ) );
			        }
			        $('.footer').html(kudos[get_random_index(kudos)] + ' You Know All ' + active_team.length + '! ');
			        $('.footer').append( score_percent + '% Accuracy! ');
			        //$('.footer').append('That\'s a rate of '+ correct_per_minute + ' correct answers a minute!');
			        completed.length = 0;
			        num_total = -1;
			        num_correct = 0;
			        is_correct = false;
			        $('.footer').append('<br />Play another level?');
			        
			        $('.content').html('');
			    }

			    //perfect score
			    else if ( is_correct && num_correct > num_total ){
			        $('.footer').append(perfect[get_random_index(perfect)]);
			        $('.footer').append(' You know ' + num_correct + ' ' + active_team_title + ' player' );
			        if (num_correct > 1){ $('.footer').append('s'); }
			        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
			        //$('.footer').append( seconds + ' seconds! ');
			        if (gaPlugin) {
						gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt') );
					}
			    }
			    //correct answer
			    else if (is_correct){
			        $('.footer').append(kudos[get_random_index(kudos)]);
			        $('.footer').append(' You know ' + num_correct + ' ' + active_team_title + ' player' );
			        if (num_correct > 1){ $('.footer').append('s'); }
			        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
			        //$('.footer').append( seconds + ' seconds! ');
			        if (gaPlugin) {
				        gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt') );
				    }
			    }
			    //incorrect answer
			    else{
			        $('.footer').append(banter[get_random_index(banter)]);
			        $('.footer').append(' You know ' + num_correct + ' ' + active_team_title + ' player' );
			        if (num_correct > 1){ $('.footer').append('s'); }
			        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
			        //$('.footer').append( seconds + ' seconds! ');
			        if (gaPlugin) {
			        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Incorrect", $(this).parent().find('.correct').data('alt') );
					}
			    }

			    //share
			    score_percent = parseInt(num_correct / (num_total+1)*100 );
			    $('.footer').append('<div class="share_button" data-score="' + score_percent + '">Share your score!</div>');

			    num_total++;

			    if( is_correct ){
			        //num_total++;
			        //advance to next question
			        setTimeout(function() {
			            new_question();
			        }, delay_time);
			    }
			}
			
			//TEST MODE
			else if( mode == 'test'){

			    $(this).addClass('clicked');
			    var is_correct = false;
			        // end_time = new Date();
			        // time = start_time - end_time;

			    if ( $(this).hasClass('correct') ){
			        is_correct = true;
			        //calculate total clicked answers for this question
			        var num_clicked = $('.clicked').length;
			        if ( num_clicked == 1 ){
			            num_correct++;
			        }
			    }
			    else{
			    	num_incorrect++;
			    }
			    //console.log('pushing to complete list: '+$('.correct').attr('data-id'), $('.correct').data('alt') );
			    completed.push( parseInt($('.correct').attr('data-id')) );
			    
			    // if( $(this).data('alt') != undefined ) {
			    //     $(this).prepend( '<p class="label">' + $(this).data('alt') +'</p>' );
			    // }

			        // end_time = new Date();
			        // seconds = Math.floor( (start_time - end_time ) / -1000);
			        // var correct_per_minute = Math.round( (num_correct / seconds ) * 60 );
			    //console.log( correct_per_minute );
			    //update score + feedback
			    $('.footer').html('');

			    //round complete
			    if( parseInt(active_team.length - completed.length) <= 0 ) {
			        if (gaPlugin) {
			        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt') );
			        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Round", "End", levels[level][0] + ' ' + mode, parseInt(num_correct / (num_total+1)*100 ) );
			        }
			        $('.footer').html('Test Complete. You Know ' + num_correct + ' of ' + active_team.length + ' players! ');
			        $('.footer').append( score_percent + '% Accuracy! ');
			        //$('.footer').append('That\'s a rate of '+ correct_per_minute + ' correct answers a minute!');
			        completed.length = 0;
			        num_total = -1;
			        num_correct = 0;
			        is_correct = false;
			        $('.footer').append('<br />Play another level?');
			        
			        $('.content').html('');
			    }
			    //not yet complete
			    else{
				    //perfect score
				    if ( is_correct && num_correct > num_total ){
				        $('.footer').append(perfect[get_random_index(perfect)]);
				        $('.footer').append(' You know ' + num_correct + ' of ' + completed.length + ' ' + active_team_title + ' players' );
				        // if (num_correct > 1){ $('.footer').append('s'); }
				        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
				        //$('.footer').append( seconds + ' seconds! ');
				        if (gaPlugin) {
				        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt'));
				        }
				    }
				    //correct answer
				    else if (is_correct){
				        $('.footer').append(kudos[get_random_index(kudos)]);
				        $('.footer').append(' You know ' + num_correct + ' of ' + completed.length + ' ' + active_team_title + ' players' );
				        // if (num_correct > 1){ $('.footer').append('s'); }
				        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
				        //$('.footer').append( seconds + ' seconds! ');
				        if (gaPlugin) {
				        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Correct", $(this).data('alt'));
						}
				    }
				    //incorrect answer
				    else{
				        $('.footer').append(banter[get_random_index(banter)]);
				        $('.footer').append(' You know ' + num_correct + ' of ' + completed.length + ' ' + active_team_title + ' players' );
				        // if (num_correct > 1){ $('.footer').append('s'); }
				        $('.footer').append( '! ' + parseInt(active_team.length - completed.length)  + ' left. ');
				        //$('.footer').append( seconds + ' seconds! ');
				        if (gaPlugin) {
				        	gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "Answer", "Incorrect", $(this).parent().find('.correct').data('alt') );
						}
				    }

				    //share
				    score_percent = parseInt(num_correct / (num_total+1)*100 );
				    $('.footer').append('<div class="share_button" data-score="' + score_percent + '">Share your score!</div>');

				    num_total++;

				    // if( is_correct ){
				        //num_total++;
				        //advance to next question
				        setTimeout(function() {
				            new_question();
				        }, delay_time);
				    // }
				}
			}
		} else {
			$(this).toggleClass('clicked');
		}
	});

	$('.menu a').on('click touch', function(e){
		e.preventDefault();
		console.log( $(this).text() );

		switch( $(this).attr('class') ) {
			case 'view_all':
				view_all();
				break;
			case 'about':
				show_about();
				break;
			case 'quiz-group':
				game_on();
				break;
			default: //quiz
				game_on();

		}

		$('.close-button').trigger('click');
	});

	$('.footer').on('click touch', '.begin', function(e){
		e.preventDefault();
		game_on();
	});

	function view_all(){

		$('.header').html( "<h1>US Presidents</h1>" );
		$('.content').html( "" );
		$('.footer').html( "" );

		for (var i = 0; i < presidents.length;i++){
			var start, end;
			start = stringtodate(presidents[i].acf.took_office);
			end = stringtodate(presidents[i].acf.left_office);

			var president_html = '<article class="answer list" data-alt="';
			president_html += presidents[i].title.rendered + ' (' + presidents[i].acf.ordinal + '), ';
			president_html += start.getFullYear() + ' - ' + end.getFullYear();
			president_html += '" style="background-image: url(' + presidents[i].acf.portrait[0].sizes.medium + ');"';
			president_html += ' data-alt="' + presidents[i].title.rendered + '">';
			president_html += '</article>';

			$('.content').append( president_html );

			$('.footer').html( '<div class="button begin"><i class="fa fa-play"></i> Begin</div>' );
		}
	}

	function show_about(){

		$('.header').html( "What is this?" );
		$('.content').html( "<p>Select play to begin the quiz. You will be shown the name of a president and portraits of 4 presidents. You must select the portrait that matches the name. The quiz is randomized so it is different every time. The quiz will also continue until you have correctly matched each president, meaning if you don't answer correctly that name will be asked again.</p>" );
		$('.footer').html( '<div class="button begin"><i class="fa fa-play"></i> Begin</div>' );

	}

});

$(document).foundation();