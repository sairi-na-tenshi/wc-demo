CComponent( 'std:noframe', function( el ){

	var nodeRoot= FValue( el )
	var nodeFrame= FLazy( function(){
		var node= nodeRoot().getElementsByTagName( 'iframe' )[0]
		return FValue( node )
	})

	var docLoaded= function(){
    	return nodeFrame().contentWindow.document
	}
	var bodyLoaded= function(){
    	var doc= docLoaded()
    	var body= doc.getElementsByTagName( 'body' )[0]
    	return body
	}

    var dissolve= function(){
    	var body= bodyLoaded()
    	var root= nodeRoot()
    	var parent= root.parentNode
    	var frag= docLoaded().createDocumentFragment()
		var child; while( child= body.firstChild ) frag.appendChild( child )
		parent.insertBefore( frag, root )
		parent.removeChild( root )

		var hrefCurrent= document.location.href
		var links= document.links
		for( var i= 0; i < links.length; ++i ){
			var link= links[i]
			if( link.href === hrefCurrent ) link.className+= ' target=true'
			else link.className= link.className.replace( /\btarget=true\b/, '' )
		}
    }

    if( bodyLoaded() ){
    	dissolve()
    } else {
	    var frame= nodeFrame()
	    if( frame.attachEvent ) frame.attachEvent( 'onload', dissolve )
	    else frame.onload= dissolve
	}

})