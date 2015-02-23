/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */

window.matchMedia = window.matchMedia || (function(doc, undefined){

  var docElem  = doc.documentElement,
      refNode  = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement('body'),
      div      = doc.createElement('div');

  div.id = 'mq-test-1';
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);

  var mqRun = function ( mq ) {
    div.innerHTML = '&shy;<style media="' + mq + '"> #mq-test-1 { width: 42px; }</style>';
    docElem.insertBefore( fakeBody, refNode );
    bool = div.offsetWidth === 42;
    docElem.removeChild( fakeBody );
    
    return { matches: bool, media: mq };
  },
  
  getEmValue = function () {
    var ret,
        body = docElem.body,
        fakeUsed = false;

    div.style.cssText = "position:absolute;font-size:1em;width:1em";

    if( !body ) {
      body = fakeUsed = doc.createElement( "body" );
      body.style.background = "none";
    }

    body.appendChild( div );

    docElem.insertBefore( body, docElem.firstChild );

    if( fakeUsed ) {
      docElem.removeChild( body );
    } else {
      body.removeChild( div );
    }
    
    //also update eminpx before returning
    ret = eminpx = parseFloat( div.offsetWidth );

    return ret;
  },
  
  //cached container for 1em value, populated the first time it's needed 
  eminpx,
  
  // verify that we have support for a simple media query
  mqSupport = mqRun( '(min-width: 0px)' ).matches;

  return function ( mq ) {
    if( mqSupport ) {
      return mqRun( mq );
    } else {
      var minW = mq.match( /\(min\-width[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          maxW = mq.match( /\(max\-width[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          minWnull = minW === null,
          maxWnull = maxW === null,
          
          minH = mq.match( /\(min\-height[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          maxH = mq.match( /\(max\-height[\s]*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/ ) && parseFloat( RegExp.$1 ) + ( RegExp.$2 || "" ),
          minHnull = minH === null,
          maxHnull = maxH === null,

          currWidth  = docElem.clientWidth,
          currHeight = docElem.clientHeight,
          em = 'em';

      if( !!minW ) { minW = parseFloat( minW ) * ( minW.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
      if( !!maxW ) { maxW = parseFloat( maxW ) * ( maxW.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
      if( !!minH ) { minH = parseFloat( minH ) * ( minH.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
      if( !!maxH ) { maxH = parseFloat( maxH ) * ( maxH.indexOf( em ) > -1 ? ( eminpx || getEmValue() ) : 1 ); }
      
      bool = (
          ( !minWnull || !maxWnull || !minHnull || !maxHnull) && 
          
          (
              ( minWnull || currWidth  >= minW ) && 
              ( maxWnull || currWidth  <= maxW ) && 
              ( minHnull || currHeight >= minH ) && 
              ( maxHnull || currHeight <= maxH )
          )
      );

      return { matches: bool, media: mq };
    }
  };

}( document ));
