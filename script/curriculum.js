/**
 *
 * sets up a BJC curriculum page -- either local or external.
 * Uses jquery.
 * This is borrowed from UCCP APCSA work
 */

llab['file'] = "";
llab['step'] = "";
llab['url_list'] = new Array();

llab.secondarySetUp = function() {

    // insert main div
    if ($("#full").length == 0) {
        $(document.body).wrapInner('<div id="full"></div>');
    }

    // create Title tag, yo
    if (getParameterByName("title") != "") {
	document.title = decodeURIComponent(getParameterByName("title"));
    }
    var titleText = document.title;
    if (titleText && $(".header").length == 0) {
	$('<div class="header"></div>').prependTo($("#full")).html(titleText);

	// I don't think this does anything. If nothing breaks I'll remove it.
	/* if (getParameterByName("title") != "") {
	    $(".header").html(titleText);
	}*/
    }
    document.body.style.marginTop = "60px";
    document.title = $(".header").text();
    
    


    // fix snap links so they run snap
    $("a.run").each(function(i) {
	$(this).attr("target", "_blank");
	$(this).attr('href', llab.getSnapRunURL(this.getAttribute('href')));
    });



    // make the vocab box if necessary
    if ($("span.vocab").length > 0) {
	if ($("div.vocab").length == 0) {
	    // it might already exist, in order to have a 'topX' class inserted.
	    $("#full").append('<div class="vocab"></div>');
	}
	var vocabDiv = $("div.vocab");
	$("span.vocab").each(function(i) {
	    if (!(this.getAttribute('term'))) {
		this.setAttribute('term', this.innerHTML)
	    }
	    vocabDiv.append('<a href="' + llab.rootURL + '/glossary/view.html?term=' + this.getAttribute('term')
			    + '" target="_vocab">' + this.getAttribute('term') + '</a>');
	});
    }

    // make the help box if necessary
    var helpSpans = $("span.help");
    if (helpSpans.length > 0) {
	$("#full").append('<div class="help"></div>');
	var helpDiv = $("div.help");
	helpSpans.each(function(i) {
	    if (!(this.getAttribute('topic'))) {
		this.setAttribute('topic', this.innerHTML)
	    };
	    helpDiv.append('<p><a href="' + llab.rootURL + '/help/view.html?topic=' + this.getAttribute('topic')
			   + '" target="_help">' + this.getAttribute('topic') + '</a></p>');
	});
    }

    // move anything that belongs in to the margin there, if necessary
    // these are the 4 class of divs that matter.
    var marginSelector = ["div.key", "div.warning", "div.help", "div.vocab"];
    if ($(marginSelector.join(',')).length > 0) {
	// add the two columns.
	$('#full').wrapInner('<div id="mainCol"></div>').prepend('<div id="marginCol"></div>');
	// this moves the divs over.  Perhaps it could do some smarter ordering
	// always put vocab at the bottom, for instance.
	var marginCol = $("#marginCol").get(0);
	$.each(marginSelector, function(i, divclass) {
	    $(divclass).appendTo(marginCol);
	});
    }

    // should this page be rendered with the topic header (left, right buttons, etc)
    llab['step'] = parseInt(getParameterByName("step"));
    var temp = getParameterByName("topic");
    if (temp != "" && !isNaN(llab['step'])) {
	if (getParameterByName("step") == "") {
	    // TODO -- this shouldn't happen, but we could intelligently find which
	    // step this should be
	}
        if (typeof temp == "object") {
            llab['file'] = temp[1];
        } else {
            llab['file'] = temp;
        }
	
	$.ajax({
	    url : llab.rootURL + "/topic/" + llab.file,
	    type : "GET",
	    dataType : "text",
	    cache : false,
	    success: llab.processLinks
	});
    }
    
    
    
}; // close secondarysetup();


/** Processes just the hyperlinked elements in this page,
 *	and creates navigation buttons. 
 */
llab.processLinks = function(data, ignored1, ignored2) {
    var temp = getParameterByName("topic");
    if (typeof temp == "object") {
        llab['file'] = temp[1];
    } else {
        llab['file'] = temp;
    }
    var hidden = [];
    var hiddenString = "";
    temp = window.location.search.substring(1).split("&");
    for (var i = 0; i < temp.length; i++) {
        var temp2 = temp[i].split("=");
        if (temp2[0].substring(0, 2) == "no" && temp2[1] == "true") {
            hidden.push(temp2[0].substring(2));
            hiddenString += ("&" + temp2[0] + "=" + temp2[1]);
        }
    }
    var course = getParameterByName("course");
    var lines = data.split("\n");
    var line;
    var text;
    var num = 0;
    var nav = $(document.createElement("div")).addClass("nav");
    var backButton = $(document.createElement("a")).addClass("backbutton");
    var b_backButton = $(document.createElement("a")).addClass("backbutton");
    backButton.text("BACK");
    backButton.button({disabled: true});
    backButton.click(llab.goBack);
    b_backButton.text("BACK");
    b_backButton.button({disabled: true});
    b_backButton.click(llab.goBack);
    var forwardButton = $(document.createElement("a")).addClass("forwardbutton");
    var b_forwardButton = $(document.createElement("a")).addClass("forwardbutton");
    forwardButton.text("FORWARD");
    forwardButton.button({disabled: true});
    forwardButton.click(llab.goForward);
    b_forwardButton.text("FORWARD");
    b_forwardButton.button({disabled: true});
    b_forwardButton.click(llab.goForward);
    var list = $(document.createElement("ul")).attr({'class': 'steps'});
    list.menu();
    list.menu("collapse");
    var option;
    var url = document.URL;
    var list_item;
    var hidden;
    var list_header = $(document.createElement("div")).attr({'class': 'list_header'});
    list_header.menu();
    
    for (var i = 0; i < lines.length; i++) {
	line = lines[i];
	line = llab.stripComments(line);
	if (line.length > 1 && (hidden.indexOf($.trim(line.slice(0, line.indexOf(":")))) == -1)) {
	    if (line.indexOf("title:") != -1) {
		/* Create a link back to the main topic.  Should this be to the file in llab? */
		url = llab.topic_launch_page + "?topic=" + llab.file + hiddenString + "&course=" + course;
		text = line.slice(line.indexOf(":") + 1);
		if (text.length > 35) {
		    text = text.slice(0, 35) + "...";
		}
		text = "<span class='main-topic-link'>" + text + "</span>";
		option = $(document.createElement("a")).attr({'href': url});
		option.html(text);
		list_item = $(document.createElement("li")).attr({'class': 'list_item'});
		list_item.append(option);
		list.prepend(list_item);
	    }
	    if (line.indexOf("[") != -1) {
		text = line.slice(line.indexOf(":") + 1, line.indexOf("["))
		if (text.length > 35) {
		    text = text.slice(0, 35) + "...";
		}
		url = (line.slice(line.indexOf("[") + 1, line.indexOf("]")));
		if (url.indexOf("http") != -1) {
		    url = llab.empty_topic_page_path + "?" + "src=" +
			url + "&" + "topic=" + llab.file + "&step=" + num +
			"&title=" + text + hiddenString + "&course=" + course;
		} else {
		    if (url.indexOf(llab.rootURL) == -1 && url.indexOf("..") == -1) {
			if (url[0] == "/") {
			    url = llab.rootURL + url;
			} else {
			    url = llab.rootURL + "/" + url;
			}
		    }
		    if (url.indexOf("?") != -1) {
			url += "&" + "topic=" + llab.file + "&step=" + num + hiddenString + "&course=" + course;
		    } else {
			url += "?" + "topic=" + llab.file + "&step=" + num + hiddenString + "&course=" + course;
		    }
		}
		llab['url_list'].push(url);
		if (num == (llab.step - 1)) {
		    backButton.attr({'value': url});
		    backButton.button({disabled: false});
		    b_backButton.attr({'value': url});
		    b_backButton.button({disabled: false});
		    option = $(document.createElement("a")).attr({'href': url});
		    option.html(text);
		    
		} else if (num == llab.step) {
		    text = "<span class='current-step-link'>" + text + "</span>";
		    option = $(document.createElement("a"));
		    option.html(text);
		    list_header.html("Click here to navigate...");
		    
		} else if (num == (llab.step + 1)) {
		    forwardButton.attr({'value': url});
		    forwardButton.button({disabled: false});
                    b_forwardButton.attr({'value': url});
		    b_forwardButton.button({disabled: false});
		    option = $(document.createElement("a")).attr({'href': url});
		    option.html(text);
		    
		} else {
		    option = $(document.createElement("a")).attr({'href': url});
		    option.html(text);
		}
		list_item = $(document.createElement("li")).attr({'class': 'list_item'});
		list_item.append(option);
		list.append(list_item);
		num = num + 1;
	    }
	}
    }
    
    if (getParameterByName("course") != "") {
        var course_link = getParameterByName("course");
        if (course_link.indexOf("http://") == -1) {
            course_link = llab.courses_path + course_link;
        }
        list_item = $(document.createElement("li")).attr({'class': 'list_item'});
        list_item.append($(document.createElement("a")).attr({"class": "course_link", "href": course_link}).html("Go to Main Course Page"));
        list.prepend(list_item);
    }

    list_header.click(function() {
	if (list_header.html() == "Click here to navigate...") {
	    list_header.html("Click again to close...");
	} else {
	    list_header.html("Click here to navigate...");
	}
	$($(".steps")[0]).slideToggle(300);
    });
    nav.append(backButton);
    nav.append(list_header);
    nav.append(forwardButton);
    nav.append(list);
    var background = $(document.createElement("div")).attr({'class': 'nav_background'});
    nav.append(background);
    $("#full").prepend(nav);
    list_header.width(list.outerWidth());
    list.slideToggle(0);    
    
    if (document.URL.indexOf(llab.empty_topic_page_path) != -1) {
	llab.addFrame();
    } else {
	$("#full").append('<div id="full-bottom-bar"></div>');
	var b_nav = $(document.createElement("div")).addClass("bottom-nav");
	b_nav.append(b_backButton);
	b_nav.append(b_forwardButton);
	b_nav.append(background.clone());
	$("#full-bottom-bar").append(b_nav);

	llab.moveAlonzo(llab.url_list.length, llab.step,
		       Number($("#full-bottom-bar").css("width").slice(0, -2)), 
		       Number(b_backButton.css("width").slice(0, -2)) +
		       Number(b_forwardButton.css("width").slice(0, -2)));
    }

    
}


llab.addFrame = function() {
    var source = getParameterByName("src");
    $("#full").append('<a href=' + source + ' target="_">Open page in new window</a><br><br>');
    $("#full").append('<div id="cont"></div>');
    var frame = $(document.createElement("iframe")).attr({'src': source, 'class': 'step_frame'});
    $("#cont").append(frame);
}

llab.goBack = function() {
    window.location.href = llab['url_list'][llab.step - 1];
}

llab.goForward = function() {
    window.location.href = llab['url_list'][llab.step + 1];
}

/* Hides the dropdown when a user clicks somewhere else. */
$('html').click(function(event) {
    if (!$(event.target).is($('.list_header')[0])) {
	$($(".steps")[0]).slideUp(300);
    }
});


/* Positions alonzo along the bottom of the lab page, signifying the student's progress.
 * numSteps is the total number of steps in the lab, currentStep is the number of the
 * current step, totalWidth is the width of the entire bottom bar, and buttonWidth is
 * the combined width of the two nav buttons.
 */
llab.moveAlonzo = function(numSteps, currentStep, totalWidth, buttonWidth) {
    var width = totalWidth - Number($('.bottom-nav').css('width').slice(0, -2));
    var result;
    if (currentStep < numSteps - 1) {
	width *= .98
	result = Math.round((currentStep * (width / (numSteps - 1)) + 1) / totalWidth * 100) + "%";
    } else {
	var picWidth = $("#full-bottom-bar").css("background-size");
	picWidth = picWidth.slice(0, picWidth.indexOf("px"));
	result = width - Number(picWidth) - 4 + "px"; // the 4 is just to add a bit of space
    }
    result = result + " 2px";
    $("#full-bottom-bar").css("background-position", result)
}


$(document).ready(llab.secondarySetUp);
