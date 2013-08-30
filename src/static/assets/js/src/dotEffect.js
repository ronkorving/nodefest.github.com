( function () {
  var DOT_RADIUS = 3;

  var RAF = ( function(){
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           function( callback ){
               window.setTimeout( callback, 1000.0 / 60.0 );
           };
  } )();

  var $el = $( '#dotEffect' );
  var $canvas = $( '<canvas/>' );
  $el.append( $canvas );
  $canvas.attr( {
    'width' : window.innerWidth,
    'height': window.innerHeight
  } );

  ctx = $canvas[ 0 ].getContext( '2d' );

  var me = {
    id : null,
    points : [
      //{
      //  x: 200,
      //  y: 100,
      //  timestamp: Date.now()
      //}
    ]
  };
  var players = {};

  var myMouseX, myMouseY;
  $( window ).on( 'mousemove', function ( e ) {
    myMouseX = e.clientX;
    myMouseY = e.clientY;
  } );

  $( window ).on( 'resize', function ( e ) {
    $canvas.attr( {
      'width' : window.innerWidth,
      'height': window.innerHeight
    } );
  } );

  function plot () {
    var data = {
      x: myMouseX,
      y: myMouseY,
      timestamp: Date.now()
    }
    me.points.push( data );
    if ( me.points.length > 5 ) {
      me.points.shift();
    }
  }

  var protInterval = setInterval( plot, 500 );

  ( function drawPoints () {
    var i, j, l;
    var now = Date.now();
    RAF( drawPoints );
    // setTimeout( drawPoints, 5000 )

    $canvas[ 0 ].width = $canvas[ 0 ].width;

    for ( i in players ) {
      ( function () {
        if ( me.id === i ) {
          return;
        }
        var points = players[ i ].points;
        for ( j = 0, l = points.length; j < l; j ++ ) {
          if ( j != 0 ) {
            var x1 = points[ j - 1 ].x;
            var y1 = points[ j - 1 ].y;
          }
          var x2 = points[ j ].x;
          var y2 = points[ j ].y;
          var timestamp = points[ j ].timestamp * 1;

          var progress = Math.min( ( now - timestamp ) / 2000, 1 );

        // console.log( timestamp, ( now - timestamp ) / 2000 );
        // console.log( x1, y1, x2, y2, progress );
          drawLine( x1, y1, x2, y2, progress );
          drawDot( x2, y2, progress );
        }
      } )();
    }

    for ( i = 0, l = me.points.length; i < l; i ++ ) {
      if ( i != 0 ) {
        var x1 = me.points[ i - 1 ].x;
        var y1 = me.points[ i - 1 ].y;
      }
      var x2 = me.points[ i ].x;
      var y2 = me.points[ i ].y;
      var timestamp = me.points[ i ].timestamp;
      var progress = Math.min( ( now - timestamp ) / 2000, 1 );
      drawLine( x1, y1, x2, y2, progress, { me: true } );
      drawDot( x2, y2, progress, { me: true } );
    }
  } )();

  function drawDot ( x, y, progress, params ) {
    if ( ! ( 0 < progress && progress < 1 ) ) {
      return;
    };
    var COLOR1 = params && params.me ? [ 82, 204, 186 ] : [ 255, 153, 167 ];
    var COLOR2 = params && params.me ? [ 255, 248, 59 ] : [ 115, 153, 230 ];
    var color = [];

    var localProgress1 = getLocalProgress( 0, 0.1, progress );
    var r = DOT_RADIUS - 3 + ( 3 * localProgress1 );
    var r2 = DOT_RADIUS + 10 - ( 6 * localProgress1 );

    for ( var i = 0; i < 3; i ++ ) {
      var localProgress2 = getLocalProgress( 0.5, 0.8, progress );
      color[ i ] = ( COLOR1[ i ] + ( COLOR2[ i ] - COLOR1[ i ] ) * localProgress2 )|0;
    }
    var alpha = 1 - getLocalProgress( 0.9, 1, progress );

    ctx.save();
    ctx.beginPath();
    ctx.arc( x, y, r, 0, Math.PI * 2, false );
    ctx.fillStyle = 'rgba( ' + color[ 0 ] + ', ' + color[ 1 ] + ', ' + color[ 2 ] + ',' + alpha + ' )';
    ctx.fill();

    ctx.beginPath();
    ctx.arc( x, y, r2, 0, Math.PI * 2, false );
    ctx.fillStyle = 'rgba( ' + color[ 0 ] + ', ' + color[ 1 ] + ', ' + color[ 2 ] + ', ' + Math.min( 0.2, alpha ) + ')';
    ctx.fill();

    ctx.restore();
  }

  function drawLine ( x1, y1, x2, y2, progress, params ) {
    if ( ! ( 0 < progress && progress < 1 ) ) {
      return;
    };
    if ( !x1 || !y1 || !x2 || !y2 ) {
      return;
    }

    var lengthOfLine = getLocalProgress( 0, 0.1, progress, params );
    var m = lengthOfLine;
    var n = 1 - lengthOfLine;
    var x3 = n * x1 + m * x2;
    var y3 = n * y1 + m * y2;
    var grad = getGrad( x1, y1, x3, y3, lengthOfLine, progress, params );

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo( x1, y1 );
    ctx.lineTo( x3, y3 );
    ctx.closePath();
    ctx.strokeStyle = grad;
    ctx.stroke();
    ctx.restore();
  }

  function getGrad( x1, y1, x2, y2, lengthOfLine, progress, params ) {
    var COLOR1 = params && params.me ? [ 82, 204, 186 ] : [ 255, 153, 167 ];
    var COLOR2 = params && params.me ? [ 255, 248, 59 ] : [ 115, 153, 230 ];
    var color = [];

    var grad  = ctx.createLinearGradient( x1, y1, x2, y2 );
    if ( 0 < progress && progress < 0.1 ) {
      grad.addColorStop( 0, 'rgb(' + COLOR2.join() + ')' );
      grad.addColorStop( 1, 'rgb(' + COLOR1.join() + ')' );
      return grad;
    }
    if ( progress < 0.6 ) {
      var localProgress = getLocalProgress( 0.1, 0.6, progress );
      for ( var i = 0; i < 3; i ++ ) {
        color[ i ] = ( COLOR1[ i ] + ( COLOR2[ i ] - COLOR1[ i ] ) * localProgress )|0;
      }
      grad.addColorStop( 0, 'rgb(' + COLOR2.join() + ')' );
      grad.addColorStop( 1, 'rgb(' + color.join() + ')' );
      return grad;
    }
    var alpha = 1 - getLocalProgress( 0.6, 1.0, progress );
    grad = 'rgba(' + COLOR2.join() + ',' + alpha + ')';
    return grad;
  }

  function getLocalProgress ( min, max, progress ) {
    if ( progress < min ) {
      return 0;
    }
    if ( progress > max ) {
      return 1;
    }
    return ( progress - min ) * 1 / ( max - min );
  }

  //---- sockets

  var socket = io.connect( 'http://pxgrid.net:8000' );

  socket.on( 'connect', function() {
    socket.emit( 'client_firstConnect', me );
  } );

  socket.on( 'server_myId', function ( params ) {
    me.id = params.myID;
    players = params.players;
  } );

  socket.on( 'server_sync', function ( allPlayers ) {
    players = allPlayers;
    if ( !!me.id ) {
      socket.emit( 'client_pushMyData', me );
    }
  } );

} )();