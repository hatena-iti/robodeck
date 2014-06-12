var server = 'http://' + document.location.host;

function getTime(){
	var currentTime = new Date();
	return currentTime;
}

function xhr(url) {
  var request = new window.XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  var data = encodeURIComponent( "d="+getTime() ).replace( /%20/g, '+' )
  request.send(data);
}

app.views.Home = Ext.extend(Ext.Panel, {
  xtype: 'panel',
  title: 'Home',
  iconCls: 'team',
  scroll: 'vertical',
  defaults: {
    width: '100%'
  },
   defaults:{
          margin: 30
      },
  items: [
    {
      xtype: 'button',
      text: 'Forward',
      // ui: 'black',
	  handler: function(){
		console.log('pressed Next');
		xhr(server + '/next');
	  }
    },
    {
      xtype: 'button',
      text: 'Back',
     // ui: 'black',
	  handler: function(){
		console.log('pressed Back');
		xhr(server + '/back');
	 }
    }
		//     {
		//       xtype: 'button',
		//       text: 'Special Event',
		//       //ui: 'black',
		// 	  handler: function(){
		// console.log('pressed Other');
		// xhr(server + '/other');
		// 	  }
		//     }
  ],
  dockedItems: [{
    xtype: 'toolbar',
    height: 46,
    dock: 'top',
    pack: 'left',
    title: 'Control Deck',
    items: [  ]
  }]
});