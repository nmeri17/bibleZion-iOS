import React, {Component} from 'react';

import store from 'react-native-simple-store';
    

var colorScheme = {bg: '#195ea1', fg: '#fff'}, size = 100, callback,

fh = [{
	headerStyle: {
      backgroundColor: '#195ea1',
    },
    headerTintColor: '#fff'/*,
    headerTitleStyle: {
      fontWeight: 'bold',
    }*/
  },
  {
	headerStyle: {
      backgroundColor: '#e01',
    },
    headerTintColor: '#fff'
	}
],

th = [{backgroundColor: '#195ea1', color: '#18e9af'}, {backgroundColor: '#eee', color: '#e01',

	paddingVertical:6, paddingHorizontal: 10}],

getRelatedStyle = (appWideStyles, mode) => {
	var ctx = [fh, th][mode], fhCb = ({headerStyle: {backgroundColor}, headerTintColor}) =>

		appWideStyles.backgroundColor==backgroundColor || appWideStyles.color==backgroundColor,

	thCb = ({backgroundColor, color}) =>
		appWideStyles.backgroundColor==backgroundColor || appWideStyles.color==color,

	cbCtx = [fhCb, thCb][mode];

	return ctx.find(cbCtx);
}

data= {misc: {alarmId: 3, alarmTime: '00:00', alarmActive: false}, appWideStyles: {}, ready: false},

// this method accepts a callback of what to do with the styles once gotten from DB
o = (cb) => {
	
	// subsequent requests to this module shouldnt make another roundtrip
	// meaning components should rely on their `state`s rather than on it
    if(data.ready !== false) {

    	callback(data); // set ready to false and make another request to trigger update?
    }
    // callback is undefined only on init (sync) but by this assignment, the module can be called without an argument
    else {

    	callback = cb;
    	
    	init();
    }
},

// initial values on app install
init = () => store.get('alarmTime').then(isset => {

	if (!isset) return store.save('alarmTime', data.misc.alarmTime);

	else data.misc.alarmTime = isset;
})

.then(() => store.get('alarmActive')).then(isset => {

	if (!isset) return store.save('alarmActive', data.misc.alarmActive);

	else data.misc.alarmActive = isset;
})

.then(() => store.get('alarmId')).then(isset => {

	if (!isset) return store.save('alarmId', data.misc.alarmId);

	else data.misc.alarmId = isset;
})

.then(() => store.get('colorScheme')).then(isset => {

	if (!isset) return store.save('colorScheme', colorScheme);

	else colorScheme = isset;
})

.then(() => store.get('size')).then(isset => {

	if (!isset) return store.save('size', size);

	else size = isset;
})

.then(() => {
	// prepare data for callback
	var {bg, fg} = colorScheme;

	data.appWideStyles = { fontSize: parseInt(size), backgroundColor: bg, color: fg, fontWeight: '300'};

	data.ready = true;

	if( typeof callback == 'function' ) callback(data);
});


module.exports ={DBProps: o, RelatedStyle: getRelatedStyle};