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