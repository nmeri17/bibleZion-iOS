import React, {Component} from 'react';

import {StyleSheet, Text, View, TouchableHighlight, FlatList, ImageBackground, } from 'react-native';

import {DBProps, RelatedStyle} from './app-wide-styling';

import Icon from 'react-native-vector-icons/Ionicons';

import SplashScreen from 'react-native-splash-screen';


export default class MenuScreen extends React.Component {

	constructor(props) {
	  super(props);
	
	  this.state = {globalStyles: {}, contentHeader: {}, titleBar: {}};
	}

	static defaultProps = {
	   screens: [{name: 'Save verse', route:'SaveVerse',icon: 'md-save', color: '#473775'},

	   	{name: 'Memorize', route:'MemorizeVerse',icon: 'md-filing', color: '#4CAF50'},

	   	{name: 'Test yourself', route:'TestVerse',icon: 'md-school', color: '#fb0'},

	   	{name: 'Settings', route:'SettingsVerse',icon: 'md-settings', color: '#795548'}],
	 }

	static navigationOptions = {
		header: null
	};

	componentDidMount() {

		DBProps(({appWideStyles}) => {

			SplashScreen.hide();

			this.setState({globalStyles: appWideStyles, contentHeader: RelatedStyle(appWideStyles,1),

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
					<View style={[styles.menuCards, {backgroundColor: color}, marginType]}>
						<Icon name={icon} style={{fontSize:40}} />
						<Text>{name}</Text>
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