import React, {Component} from 'react';

import {StyleSheet, Text, View, TouchableHighlight, FlatList, ImageBackground, Platform, } from 'react-native';

import {DBProps, RelatedStyle} from './app-wide-styling';

import Icon from 'react-native-vector-icons/Ionicons';

import SplashScreen from 'react-native-splash-screen';


export default class MenuScreen extends React.Component {

	constructor(props) {
	  super(props);
	
	  this.state = {globalStyles: {}, contentHeader: {}, titleBar: {}};
	}

	static defaultProps = {
	   screens: [{name: 'Save verse', route:'SaveVerse',icon: Platform.select({ios:'ios-save', android:'md-save'})},

	   	{name: 'Memorize', route:'MemorizeVerse',icon: Platform.select({ios:'ios-filing', android:'md-filing'})},

	   	{name: 'Test yourself', route:'TestVerse',icon: Platform.select({ios:'ios-school', android:'md-school'})},

	   	{name: 'Settings', route:'SettingsVerse',icon: Platform.select({ios:'ios-settings', android:'md-settings'})}],
	 }

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
		var that = this;

		DBProps(({appWideStyles}) => {

			SplashScreen.hide();

			that.setState({globalStyles: appWideStyles, contentHeader: RelatedStyle(appWideStyles,1),

				titleBar: RelatedStyle(appWideStyles,0)
			})
		});
	}

	refreshStyles () {
		var that = this;

		DBProps(data => {

			data.ready = false;

			DBProps(({appWideStyles}) => {

				that.setState({globalStyles: appWideStyles, contentHeader: RelatedStyle(appWideStyles,1),

					titleBar: RelatedStyle(appWideStyles,0)
				})
			})
		});
	}

	render () {
		return (<ImageBackground source={require('../assets/menu-bg.jpg')} style={styles.menuBg}>
			<FlatList
	          data={this.props.screens} numColumns={2} key='grandMenu' columnWrapperStyle={styles.dataColumn}

	          style={{marginHorizontal: 25}} renderItem={function ({item: {name,route,icon, color}}, index) {

	          	var {globalStyles, contentHeader, titleBar} = this.state,

	          	marginType = index%2 ? styles.frontMargin: styles.backMargin;

	          	return <TouchableHighlight key={index} style={{flex:1, flexDirection:'row'}} underlayColor='transparent'

					onPress={() => this.props.navigation.navigate(route,
						{bodyStyles: globalStyles, titleBar: titleBar, contentHeader: contentHeader,

							dbRefresh: this.refreshStyles.bind(this)
						}
					)}
					>
					<View style={[styles.menuCards, {backgroundColor: '#0009'}, marginType]}>
						<Icon name={icon} style={{fontSize:40, color: '#fff'}} />
						<Text style={{color: '#fff'}}>{name}</Text>
					</View>
				</TouchableHighlight>
	          }.bind(this)}
	        /></ImageBackground>);
	}
}

const styles = StyleSheet.create({
  menuCards: {
    borderRadius: 10,
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  dataColumn: {
  	justifyContent: 'space-between',
  	marginTop: 50
  },
  menuBg: {
  	flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover'
  },
  frontMargin: {
  	marginRight: 100
  }
});