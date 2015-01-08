// ==UserScript==
// @name        Coloured Trello Jira cards
// @namespace   http://reaktor.fi/xrmnwbxots5tk1w8zklq
// @version     0.3
// @description Create coloured cards and Jira links when Trello card title starts with an issue number like XYZ-123
// @match       https://trello.com/*
// @grant	none
// @downloadURL	https://github.com/ritola/trello.user.js
// @updateURL	https://github.com/ritola/trello.user.js
// ==/UserScript==

var $ = unsafeWindow.jQuery
var _ = unsafeWindow._
var jiraUrl = 'http://jira.internal'

$(function(){
	$('.js-toggle-label-filter, .js-select-member, .js-due-filter, .js-clear-all, .ui-droppable').live('mouseup', delayedUpdate);
	$('.js-input').live('keyup', delayedUpdate);

	delayedUpdate();
});

document.body.addEventListener('DOMNodeInserted',function(e){ if(e.target.id=='board') delayedUpdate() })
$(".list-cards").live('DOMNodeInserted',function(e){ if ($(e.target).hasClass('list-card')) updateOne($(e.target).find('.list-card-title')) })

function update() {
    $('.list-card-title').each(function(x, y) { updateOne($(this)) })
}

function updateOne(e) {
    if (!e || !e.html()) return
    var issue = parseTitle(e).issue
    createJiraLink(e)
    if (issue) e.parent('.list-card').css('background-color', hslToCss(hash(issue), 1, 0.9))
}

function createJiraLink(e) {
    var title = parseTitle(e)
    if (!title.issue) return

    var link = $('<a href="' + jiraUrl + '/browse/' + title.issue + '" target="blank">' + title.issue + '</a>').click(jiraLinkClick)
    var span = e.find('span').clone()
    e.html(title.label)
    e.prepend(link).prepend(span)
}

function jiraLinkClick(e) { e.stopPropagation() }

function parseTitle(e) {
    var span = e.find('span')
    var label = _.rest(e.text().split(span.text())).join(span.text())

    var issue = label.match(/^[A-Z]+-[0-9]+/)
    if (issue) {
        return {issue: _.head(issue), label: _.rest(label.split(issue)).join(issue) }
    }
    return {label: label}
}

function hash(s) {
    return pseudoRandom(_(s.split(''))
		.map(function(c) {return c.charCodeAt(0)})
    	.reduce(function(x, y){ return (x + y) }, 0), 256) / 256
}

function hslToCss(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
}

function pseudoRandom(seed, maximum){
        n = (314159265 * seed + 2718281) % 65536;
        c = Math.round( ((n / 65536) * 100) % 100 );
        output = Math.floor( c/100 * maximum );

        return output;
}

function delayedUpdate() { setTimeout(update) }

