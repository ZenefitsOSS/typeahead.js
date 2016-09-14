/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

// inspired by https://github.com/jharding/bearhug

var highlight = (function(doc) {
  'use strict';

  var defaults = {
        node: null,
        pattern: null,
        tagName: 'strong',
        className: null,
        wordsOnly: false,
        caseSensitive: false
      };

  return function hightlight(o) {
    var regex;

    o = _.mixin({}, defaults, o);

    if (!o.node || !o.pattern) {
      // fail silently
      return;
    }

    // support wrapping multiple patterns
    o.pattern = _.isArray(o.pattern) ? o.pattern : [o.pattern];
    o.pattern = o.pattern.length ? o.pattern[0].match(/\S+/g) : o.pattern;
    o.pattern = _.filter(o.pattern, function(s) {
      return s.length > 1 && (!o.stopWords || o.stopWords.indexOf(s) === -1);
    });
    if (o.pattern.length === 0) {
      return;
    }

    regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly, o.beginningOnly);
    traverse(o.node, hightlightTextNode);

    function hightlightTextNode(textNode) {
      var match, patternNode, wrapperNode;

      if (match = regex.exec(textNode.data)) {
        wrapperNode = doc.createElement(o.tagName);
        o.className && (wrapperNode.className = o.className);

        patternNode = textNode.splitText(match.index);
        patternNode.splitText(match[0].length);
        wrapperNode.appendChild(patternNode.cloneNode(true));

        textNode.parentNode.replaceChild(wrapperNode, patternNode);
      }

      return !!match;
    }

    function traverse(el, hightlightTextNode) {
      var childNode, TEXT_NODE_TYPE = 3;

      for (var i = 0; i < el.childNodes.length; i++) {
        childNode = el.childNodes[i];

        if (childNode.nodeType === TEXT_NODE_TYPE) {
          i += hightlightTextNode(childNode) ? 1 : 0;
        }

        else {
          traverse(childNode, hightlightTextNode);
        }
      }
    }
  };

  function getRegex(patterns, caseSensitive, wordsOnly, beginningOnly) {
    var escapedPatterns = [], regexStr;

    for (var i = 0, len = patterns.length; i < len; i++) {
      escapedPatterns.push(_.escapeRegExChars(patterns[i]));
    }

    regexStr = "(" + escapedPatterns.join("|") + ")";
    if (wordsOnly) {
      regexStr = "\\b" + regexStr + "\\b";
    }
    else if (beginningOnly) {
      regexStr = "\\b" + regexStr;
    }

    return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, 'i');
  }
})(window.document);
