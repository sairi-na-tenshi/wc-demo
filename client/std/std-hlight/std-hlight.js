var HLight= {}

HLight.lang= {}

HLight.lang.text= function( str ){
	return String( str || '' )
	.split( '&' ).join( '&amp;' )
	.split( '>' ).join( '&gt;' )
	.split( '<' ).join( '&lt;' )
	.split( '\n' ).join( '<br />' )
}

HLight.TagWrapper= function( name ){
	var open= '<' + name + '>'
	var close= '</' + name + '>'
	return function( str ){
		return open + str + close
	}
}

HLight.FConcurentLang= function( map ){
	var syntaxes= []
	for( var syntax in map ) syntaxes.push( syntax )
	var parser= RegExp( '([\\s\\S]*?)((' + syntaxes.join( ')|(' ) + ')|$)', 'g' )
//	console.log( parser );
	var proc= function( str, prefix, content ){
		prefix= HLight.lang.text( prefix || '' )
		if( !content ) return prefix
		var argN= 4
		var synN= 0
		while( synN < syntaxes.length ){
            var handler= map[ syntaxes[ synN ] ]
            if( arguments[ argN - 1 ] ){
	            var args= [].slice.call( arguments, argN, argN + handler.length )
	            content= handler.apply( this, args )
	            return prefix + content
	        } else {
                argN+= handler.length + 1
                ++synN
	        }
		}
	}
	return FCached( function( str ){
		return String( str || '' ).replace( parser, proc )
	})
}

HLight.revert= function( str ){
	noLFCR:     str= str.split( /\r/ ).join( '' )
	stripTags:  str= str.split( /<.*?>/ ).join( '' )
	decodeNBSP: str= str.split( '&nbsp;' ).join( ' ' )
	decodeGT:   str= str.split( '&gt;' ).join( '>' )
	decodeLT:   str= str.split( '&lt;' ).join( '<' )
	decodeAMP:  str= str.split( '&amp;' ).join( '&' )
	return str
}

CComponent( 'std:hlight', function( el ){
	var lang= CHiqus( el.className ).get( 'lang' )
	var hlight= HLight.lang[ lang ] || HLight.lang.text
	el.innerHTML= hlight( HLight.revert( el.innerHTML ) )
})
