with( HLight ) lang.code_sign= FCached
(	FPipe
	(   lang.text
	,	TagWrapper( 'std:hlight-code-sign' )
	)
)

with( HLight ) lang.code= FCached( function( str ){
	return String( str || '' )
	.replace
	(	/^(\n?#![^\n]*(\w{2,})[^\n]*)?([\s\S]*)$/
	,	function( str, sign, langName, content ){
			var langContent= lang[ langName ] || lang.text
			sign= sign ? lang.code_sign( sign ) : ''
			content= langContent( content )
			return sign + content
		}
	)
})
