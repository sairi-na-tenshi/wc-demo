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
