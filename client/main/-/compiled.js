/* include( '../_base/CClock.js' ); */

var CClock= function( ){
	if( this instanceof CClock ) return
	var clock= new CClock

	var timerID= FProp()

	var active= FProp( false )
	clock.active= FPoly( active, function( val ){
		active( val )
		if( timerID() ) timerID( window.clearTimeout( timerID() ) )
		if( val ) timerID( window.setTimeout( proc(), latency() ) )
		return this
	})

	var latency= FProp( 0 )
	clock.latency= FPoly( latency, function( val ){
		latency( val )
		clock.active( active() )
		return this
	} )

	var proc= FProp()
	clock.proc= FPoly( proc, function( val ){
		proc( val )
		clock.active( active() )
		return this
	} )

	return clock
}



/* include( '../_base/CComponent.js' ); */

var CComponent= new function(){

Version: 3
Description: 'attach widget constructor to DOM as live component'
License: 'public domain'
Implementation:

var CComponent= function( tag, factory ){
    if(!( this instanceof CComponent )) return new CComponent( tag, factory )

    var elements= [], widgets= []
    var timerTracking, timerCleaning

    var latencyTracking= 50
    var latencyCleaning= 100
    var field= 'CComponent:' + Math.random()

    var attach= function( el ){
        var widget= new factory( el ) || null
        el[ field ]= widget
        if( !widget ) return
        elements.push( el )
        widgets.push( widget )
    }

    var attachIfLoaded= function( el ){
        var cur= el
        do {
            if( !cur.nextSibling ) continue
            attach( el )
            break
        } while( cur= cur.parentNode )
    }

    var tracking= function( ){
        var nodes= CComponent.tags( tag )
        for( var i= 0, len= nodes.length; i < len; ++i ){
            var el= nodes[ i ]
            var widget= el[ field ]
            if( typeof widget === 'object' ) continue
            attachIfLoaded( el )
        }
        timerTracking= setTimeout( tracking, latencyTracking )
    }

    var cleaning= function( ){
        var doc= document.documentElement
        checking: for( var i= elements.length; i--; ){
            var el= elements[ i ]
            var cur= el
            do {
                if( cur === doc ) continue checking
            } while( cur= cur.parentNode )
            var widget= el[ field ]
            if( widget.destroy ) widget.destroy()
            el[ field ]= void 0
            elements.splice( i, 1 )
            widgets.splice( i, 1 )
        }
        timerCleaning= setTimeout( cleaning, latencyCleaning )
    }

    var revive= function( ){
        tracking()
        cleaning()
    }
    var freeze= function( ){
        timerTracking= clearTimeout( timerTracking )
        timerCleaning= clearTimeout( timerCleaning )
    }

    var destroy= function( ){
        freeze()
        for( var i= elements.length; i--; ){
            var widget= widgets[ i ]
            if( widget.destroy ) widget.destroy()
        }
        elements= []
        widgets= []
    }

    var onload= function( ){ attachIfLoaded= attach }
    window.addEventListener
    ? window.addEventListener( 'load', onload, false )
    : window.attachEvent( 'onload', onload )

    this.tag= function( ){ return tag }
    this.field= function( ){ return field }
    this.factory= function( ){ return factory }
    this.latencyTracking= function( ){ return latencyTracking }
    this.latencyCleaning= function( ){ return latencyCleaning }
    this.elements= function( ){ return elements.slice( 0 ) }
    this.widgets= function( ){ return widgets.slice( 0 ) }
    this.revive= revive
    this.freeze= freeze
    this.destroy= destroy

    revive()
}

var cacheTags= {}

CComponent.tags= function( name ){
    var nodes= cacheTags[ name ]
    if( !nodes ){
        var isIE= /*@cc_on!@*/ false
        var chunks= /(?:(\w+):)?([-\w]+)/.exec( name )
        var scope= isIE && chunks[1] || ''
        var tag= isIE && chunks[2]|| name
        nodes= cacheTags[ name ]= document.getElementsByTagName( tag )
        nodes.scopeName= scope
    }
    var res= [], scope= nodes.scopeName
    if( scope ){
        for( var i= 0, len= nodes.length; i < len; ++i ){
            var node= nodes[ i ]
            if( node.scopeName !== scope ) continue
            res.push( node )
        }
    } else     {
        for( var i= 0, len= nodes.length; i < len; ++i )
            res.push( nodes[ i ] )
    };
    return res
}

Export: return CComponent

}



/* include( '../_base/CHiqus.js' ); */

var CHiqus= new function(){

Version: 1
Description: "parse, serialize and merge any 'HIerarhical QUery String'"
License: 'public domain'

Implementation:

var sepHiqusList= '/|; &'
var sepPathList= '=:_'

var sepHiqusDefault= sepHiqusList.charAt(0)
var sepPathDefault= sepPathList.charAt(0)

var sepHiqusRegexp= RegExp( '[' + sepHiqusList + ']', 'g' )
var sepPathRegexp= RegExp( '[' + sepPathList + ']', 'g' )

var encode= function( str ){
    return encodeURIComponent( str ).split( '_' ).join( '%5F' )
}
var decode= function( str ){
    return decodeURIComponent( str )
}

var splitHiqus= function( str ){
    return str.split( sepHiqusRegexp )
}
var splitPath= function( str ){
    var path= String( str ).split( sepPathRegexp )
    for( var j= path.length - 1; j >= 0; --j ) path[ j ]= decode( path[ j ] )
    return path
}

var get= function( ){
    var obj= this
    for( var i= 0, len= arguments.length; i < len; ++i ){
        var name= arguments[ i ]
        if( !name ) throw new Error( 'name is empty' )
        obj= obj[ name ]
        if( typeof obj !== 'object' ) return obj
    }
    return obj
}

var placin= function( ){
    var obj= this
    for( var i= 0, len= arguments.length; i < len; ++i ){
        var name= arguments[ i ]
        if( name ){
            var o= obj[ name ]
            if(( !o )||( typeof o !== 'object' )) o= obj[ name ]= []
        } else {
            var o= []
            obj.push( o )
        }
        obj= o
    }
    return obj
}

var put= function( ){
    var obj= this
    var len= arguments.length
    if( !len ) return this
    var val= arguments[ len - 1 ]
    var key= arguments[ len - 2 ]
    if( len > 2 ){
        var path= [];
        for( var i= len - 2; i-- ;)
        	path[ i ]= arguments[ i ]
        obj= placin.apply( obj, path )
    }
    if( typeof val === 'object' ){
        var v= ( len === 1 )
        	? obj
        	: placin.call( obj, key )
        for( var i in val )
        	if( val.hasOwnProperty( i ) )
        		put.call( v, i, val[ i ] )
    } else {
        if( key === void 0 ) obj[ val ]= true
        else obj[ key ]= val
    }
    return this
}

var parsin= function( str ){
    var chunks= splitHiqus( str )
    for( var i= 0, len= chunks.length; i < len; ++i ){
        var path= chunks[i]
        if( !path ) continue
        path= splitPath( path )
        put.apply( this, path )
    }
      return this
}

var serialize= function( prefix, obj ){
    var list= []
    for( var key in obj ) if( obj.hasOwnProperty( key ) ){
        var val= obj[ key ]
        var k= encode( key )
        if( !val ) continue;
        if(( val === true )&&( !prefix )){
        	list.push( k )
	    } else if( typeof val !== 'object' ){
	        list.push( prefix + k + sepPathDefault + encode( val ) )
	    } else {
        	list.push( serialize( prefix + k + sepPathDefault, val ) )
        }
    }
    return list.join( sepHiqusDefault )
}

var CHiqus= function( ){
    var hiqus= ( this instanceof CHiqus ) ? this: new CHiqus
    var data= placin.call( hiqus, '_data' )
    for( var i= 0, len= arguments.length; i < len; ++i ){
        var arg= arguments[i]
        if( arg instanceof CHiqus ) arg= arg._data
        var invoke= ( Object( arg ) instanceof String ) ? parsin : put
        invoke.call( data, arg )
    }
    return hiqus
}

CHiqus.prototype= new function(){

    this.put= function(){
        var hiqus= CHiqus( this )
        put.apply( hiqus._data, arguments )
        return hiqus
    }

    this.get= function( ){
        var val= get.apply( this._data, arguments )
        if( typeof val === 'object' ) val= put.call( [], val )
        return val
    }

    this.sub= function(){
        var hiqus= CHiqus()
        var val= get.apply( this._data, arguments )
        if( typeof val !== 'object' ) val= [ val ]
        hiqus._data= val
        return hiqus
    }

    this.toString = function(){
        var str= serialize( '', this._data )
        this.toString= function(){ return str }
        return str
    }

}

Export: return CHiqus

Usage:

alert(
    CHiqus
    (    CHiqus( '| a:b:c:1 / a:b: ; a:b::c & a=b__d' )
        .sub( 'a', 'b' )
        .put( [ 'e', 'f' ] )
    ,    'g/h'
    )
    .get( 4 )
) // alerts 'g'

}


/*;(function( x, y ){
    if( '' + x != y ){
	    console.log( x, y )
	    throw new Error( 'fail test: [ ' + x + ' ]!=[ ' + y + ' ]' )
	}
	return arguments.callee
})

( CHiqus( ),    '' )
( CHiqus( {} ), '' )
( CHiqus( [] ), '' )
( CHiqus( [1] ), '0=1' )
( CHiqus( [true] ), '0' )
( CHiqus( {1:true} ), '1' )
( CHiqus( [1,2] ), '0=1/1=2' )
( CHiqus( [false,true] ), '1' )
( CHiqus( {a:1} ), 'a=1' )
( CHiqus( {'a_b':1} ), 'a%5Fb=1' )
( CHiqus( {a:{b:1}} ), 'a=b=1' )
( CHiqus( {a:1,b:2} ), 'a=1/b=2' )
( CHiqus( {a:1},{b:2} ), 'a=1/b=2' )
( CHiqus( {a:1},'b:2' ), 'a=1/b=2' )
( CHiqus( {a:1},{b:2} ), new CHiqus( {a:1},{b:2} ) )
( CHiqus( CHiqus({a:1}), CHiqus({b:2}) ), 'a=1/b=2' )

( CHiqus( '' ), '' )
( CHiqus( 'x' ), 'x' )
( CHiqus( '=a' ), '=a' )
( CHiqus( 'b=1' ), 'b=1' )
( CHiqus( 'c:1' ), 'c=1' )
( CHiqus( 'd_1' ), 'd=1' )
( CHiqus( 'a=b=1' ), 'a=b=1' )
( CHiqus( 'a=1/b=2' ), 'a=1/b=2' )
( CHiqus( 'a=1;b=2' ), 'a=1/b=2' )
( CHiqus( 'a=1 b=2' ), 'a=1/b=2' )
( CHiqus( 'a=1&b=2' ), 'a=1/b=2' )
( CHiqus( 'a=1|b=2' ), 'a=1/b=2' )

( CHiqus( '1/2' ).get(), ',true,true' )
( CHiqus( 'a=1/b=2' ).get( 'a' ), '1' )
( CHiqus( 'a=1=2/b=2=3' ).get( 'b', 2 ), '3' )
( ( ( a= CHiqus( 'a=1/b=2' ) ).get( 'a' ), a ), 'a=1/b=2' )

( CHiqus( 'a=1/b=2' ).sub(), 'a=1/b=2' )
( CHiqus( 'a=b=1/a=c=2/d=3' ).sub( 'a' ), 'b=1/c=2' )
( ( a= CHiqus( 'a=1/b=2' ) ).sub( 'a' ) && a, 'a=1/b=2' )

( CHiqus( 'a=1' ).put( {b:2} ), 'a=1/b=2' )
( CHiqus( 'a=1' ).put( 'a', {b:2} ), 'a=b=2' )
( ( a= CHiqus( 'c=1' ) ).put( 'b=2' ) && a, 'c=1' )
; */


/* include( '../_base/FCached.js' ); */

var FCached= function( func ){
	var cache= {}
	return function( arg ){
		key= 'cache:' + arg
		if( key in cache ) return cache[ key ]
		return cache[ key ]= func.apply( this, arguments )
	}
}



/* include( '../_base/FLazy.js' ); */

var FLazy= function( gen ){
	var value= function(){
		value= gen()
		return value.apply( this, arguments )
	}
	return function(){
		return value.apply( this. arguments )
	}
}



/* include( '../_base/FPipe.js' ); */

FPipe= function( ){
	var list= arguments
	var len= list.length
	return function( data ){
		for( var i= 0; i < len; ++i ) data= list[ i ].call( this, data )
		return data
	}
}


/* include( '../_base/FPoly.js' ); */

var FPoly= function(){
	var map= arguments
	return function(){
		return map[ arguments.length ].apply( this, arguments )
	}
}



/* include( '../_base/FProp.js' ); */

var FProp= function( value ){
	return FPoly
	(   function(){
			return value
		}
	,	function( val ){
			value= val
			return this
		}
	)
}



/* include( '../_base/FTrottler.js' ); */

var FTrottler= function( latency, func ){
	var timer= 0
    return function(){
    	if( timer ) timer= clearTimeout( timer )
    	timer= setTimeout( func, latency )
    }
}



/* include( '../_base/FValue.js' ); */

var FValue= function( val ){
	return function(){
		return val
	}
}

