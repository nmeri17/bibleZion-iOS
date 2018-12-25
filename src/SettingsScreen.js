import React, {Component} from 'react';

import {Platform, StyleSheet, Text, View, TextInput, Button, TimePickerAndroid, Modal, Picker,

	TouchableOpacity, SectionList, TouchableHighlight} from 'react-native';

import {DBProps,} from './app-wide-styling';

import TimePicker from 'react-native-timepicker';

import store from 'react-native-simple-store';

import RNCalendarEvents from 'react-native-calendar-events';

import Toast from 'rn-toaster';


export default class SettingsScreen extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = { alarmTime: '00:00', alarmActive:false, selectedTheme: 0, selectedSize: 0,

			// read component styling from here instead since its altered after compnent mount
			globalStyles: params.bodyStyles, alarmId: 0, contentHeader: params.contentHeader
		};
	}

	  static defaultProps = {

		themeOptions: [ {name: 'white on blue', fg: '#fff', bg: '#195ea1'}, {name: 'red on white', fg: '#e01', bg: '#fff'} ],

		sizeOptions: [ {name: 'large', value: 150}, {name: 'normal', value: 100}, {name: 'small', value: 80},
		  	{name: 'extra large', value: 200}],

		alarmOutput: Platform.select({
			ios: <TimePicker
				
				selectedHour={8}
				selectedMinute={30}
				minuteInterval={5}
				onValueChange={ (hour,minute) => this.setAlarm(hour,minute)} />,
			android: async function () {
				var {action, minute, hour} = await TimePickerAndroid.open({ hour: 8, minute: 30, is24Hour: true});
      
				if (action === TimePickerAndroid.timeSetAction) this.setAlarm(hour, minute);
			}
		}),

		headerOptions: [{backgroundColor: '#195ea1', color: '#18e9af'}, {backgroundColor: '#eee', color: '#e01',

			paddingVertical:6, paddingHorizontal: 10}],
	}

	static navigationOptions = ({ navigation }) => {

		var newParams = {};

		Object.assign(newParams, navigation.state.params.titleBar, {headerRight: null});

	    return newParams;
	};

	componentDidMount() {
		var that = this;

		DBProps(({misc: {alarmActive,alarmId,alarmTime}}) =>{

			that.setState({alarmTime: alarmTime, alarmActive: alarmActive, alarmId: alarmId},

				() => that.getUpdatedProps()
			)
		});
	}

    componentDidUpdate(prevProps, prevState) {
  		var {navigation: {state: {params}}} = prevProps;

  		params.dbRefresh(); // bubble latest changes to menu component
    }

	render () {

		var {globalStyles, contentHeader, alarmActive, selectedTheme, selectedSize, alarmTime} = this.state,

		{themeOptions, alarmOutput} = this.props, catContainer = {flexDirection: 'row', flexWrap: 'wrap'},

		catStyles = {color: globalStyles.color, width: '100%'},

		themeSection = [
			(
				<View style={catContainer}>
					<Text style={catStyles}>Skin</Text>
					<Picker mode='dropdown' selectedValue={selectedTheme}
						onValueChange = {(itemValue, itemIndex) => this.saveSettings(itemValue, itemIndex,'theme')}
						style={catStyles}
					>
						{themeOptions.map((obj,i) => <Picker.Item label={obj.name} value={i} key={'ts'+i} />)}
					</Picker>
				</View>
			),
			(
				<View style={catContainer}>
					<Text style={catStyles}>Text size</Text>
					
					<Picker mode='dropdown' selectedValue={selectedSize}
						onValueChange = {(itemValue, itemIndex) => this.saveSettings(itemValue, itemIndex,'size')}
						style={catStyles}
					>
						{this.props.sizeOptions.map((obj,i) => <Picker.Item label={obj.name} value={obj.value} key={'ss'+i} />)}
					</Picker>
				</View>
			)
		],
		externalSection = [
			(
				<View ref='alarmRow' style={[catContainer, {justifyContent: 'space-between',flex:1}]}>
					<View style={{flex: 5}}>
						<TouchableOpacity onPress={() =>(alarmOutput.bind(this))()}
							style={{flex:2}}
						>
							<Text style={catStyles}>Reminder time</Text>
						</TouchableOpacity>

						<Text style={[{flex:1}, catStyles]}>{alarmTime}</Text>
					</View>
					<Button title='cancel' disabled={!alarmActive} onPress={() => this.alarmToggleHandler}
						style={{flex: 1}}/>
				</View>
			),
			(
				<View style={catContainer}>
					<Text style={catStyles}>synchronize</Text>
					<Picker 
						children={['Google Drive', 'DropBox', 'One Drive'].map((el,i) => <Picker.Item label={el} value={i} key={i} />)}
						mode='dropdown' style={catStyles}
						>
					</Picker>
				</View>
			),
		];

		return (
			<View style={{flex:1, paddingVertical: 50, paddingHorizontal:10, backgroundColor: globalStyles.backgroundColor}}>
				<SectionList
					renderItem={({item, index, separators}) => (
   						
   						<TouchableHighlight onShowUnderlay={separators.highlight} onHideUnderlay={separators.unhighlight}>
   							
   							<View style={[globalStyles, styles.rows]}>{item}</View>
   						</TouchableHighlight>
   					)}
  
  					renderSectionHeader={({section: {title}}) => (
    			
    					<Text style={contentHeader}>{title}</Text>
  					)}
					
					/*ItemSeparatorComponent={() => <View style={{ height: 1, flex: 1, backgroundColor: "#99a" }}/>
    
					}*/

  					sections={[
						{title: 'Appearance', data: themeSection},
						{title: 'External', data: externalSection},
					]}

					keyExtractor={(item, index) => 'settings:' + index}
				/>
 
		        <Toast ref={component => (this._toast = component)} style={styles.toast}></Toast>
			</View>
		);
	}

	saveSettings (itemValue, itemIndex,mode) {

		var { fontSize: prevSize, backgroundColor: prevBg, color: prevFg } = this.state.globalStyles,

		size = mode == 'size' ? this.props.sizeOptions[itemIndex].value : prevSize,

		themeObj = mode == 'theme' ? this.props.themeOptions[itemIndex] : {bg: prevBg, fg: prevFg};

		store.save('colorScheme', themeObj).then( () => {
			
			// save for scalar values
			store.save('size', size).then( () => {
				var {bg, fg} = themeObj;

				this.setState({ globalStyles: { fontSize: size, backgroundColor: bg, color: fg },},

				() =>this.getUpdatedProps())
			})
		}).catch(e => console.error(e));
	}

	setAlarm(hour, min, inactive) {
		var time = `${hour}:${min}`, bool = !inactive, // if undefined or null, enable alarm

		that = this;

		// capture datepicker input and store that as time
		store.save('alarmTime', time).then( () =>

			store.save('alarmActive', bool).then( () =>

				store.save('alarmId', that.state.alarmId).then( () =>

					RNCalendarEvents.authorizationStatus().then(status => {

						if (status != 'authorized' && Platform.OS == 'android') RNCalendarEvents.authorizeEventStore()

							.then(status => this.alarmAuthorized(status, {time:time, bool:bool}))

							.catch(err => that.postAlarmAction(err));

						else this.alarmAuthorized(status, {time:time, bool:bool});

					}).catch(err => that.postAlarmAction(err))
				)
			)
		);
	}

	postAlarmAction (err) {
		var that = this;console.log(err)
		that._toast.show({
			position: Toast.constants.gravity.top,
  			duration: 255,
			children: err,
			animationEnd: () => {
				that._toast._toastAnimationToggle = setTimeout(() => {
					that._toast.hide({
					duration: 5,
						animationEnd: () => { /* do something, anything! */ }
					});
				}, 3000);
			}
		});
	}

	alarmToggleHandler () {
		var [hour, mins] = this.state.alarmTime.split(':');

		this.setAlarm(hour, mins,1);
	}

	getUpdatedProps () {
 
		var {themeOptions, sizeOptions, headerOptions} = this.props, {backgroundColor,color, fontSize} = this.state.globalStyles,

		selectedTheme = themeOptions.findIndex(({bg,fg}) => bg==backgroundColor && fg==color),

		// NOTE: scalar values here so the picker is holding actual values rather than indexes
		selectedSize = sizeOptions.find(({value}) => {
			return fontSize==value
		}),

		headerTheme = headerOptions.find(({backgroundColor:backgroundColorNew, color:colorNew}) =>
			backgroundColorNew==backgroundColor || colorNew==color
		);

		selectedSize = selectedSize !== void(4) ? selectedSize.value: selectedSize;

		this.setState({selectedTheme: selectedTheme, selectedSize: selectedSize,

			contentHeader: headerTheme});
	}

	alarmAuthorized (status, {time, bool}) {

		if (status == 'authorized' || Platform.OS == 'ios') {
			var titleStr  = 'Bible Zion Memorization', evtId = 'activate-memo',

			timeFormat = time.split(':').map(x => x.length < 2 ? 0+x: x), h = new Date();

			// create new calendar entry
			if (bool) return RNCalendarEvents.saveEvent(titleStr, {

				title: titleStr,

				recurrenceRule: {frequency : 'daily', occurrence: 365, 

				endDate: new Date((h.getFullYear()+1) + '-' + (h.getMonth()+1) + '-' + h.getDate()).toISOString(),interval: 2},

				startDate: new Date(new Date().setHours(...timeFormat)).toISOString(),

				description: 'Have you memorized a verse today?',

				alarms: [{
					date: 1 // relative offset (in minutes) from the start date
				}]
			})

			.then(id =>
				this.setState( {alarmTime: timeFormat.join(':'), alarmActive: bool, alarmId: id},

				this.postAlarmAction('added reminder'))
			);

			// remove event
			return RNCalendarEvents.removeEvent(this.state.alarmId)

			.then(() => this.setState( {alarmActive: bool}, this.postAlarmAction('removed reminder')));
		}
	}
}

const styles = StyleSheet.create({
	toast: {
		height: 30,
		marginTop: 180,
	},
	rows: {
		flex: 1,
		flexDirection: 'row',
	}
});