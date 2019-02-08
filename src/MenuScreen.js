import React, {Component} from 'react';

import {StyleSheet, Text, View, TouchableHighlight, FlatList, ImageBackground, Platform, } from 'react-native';

import {DBProps, RelatedStyle, AppScreens} from './app-wide-styling';

import Icon from 'react-native-vector-icons/Ionicons';

import SplashScreen from 'react-native-splash-screen';


export default class MenuScreen extends React.Component {

	constructor(props) {
	  super(props);
	
	  this.state = {globalStyles: {}, contentHeader: {}, titleBar: {}};
	}

	static navigationOptions = {
		header: null
	};

	componentDidMount() {
		var that = this;

		DBProps(({appWideStyles}) => {

			var contentHeader = RelatedStyle(appWideStyles,1);

			SplashScreen.hide();

			that.setState({globalStyles: appWideStyles, contentHeader,

				titleBar: {...RelatedStyle(appWideStyles,0), headerRight: that.getHeaderRight(contentHeader)}
			})
		});
	}

	refreshStyles () {
		var that = this;

		DBProps(data => {

			data.ready = false;

			DBProps(({appWideStyles}) => {

				that.setState({globalStyles: appWideStyles, contentHeader: RelatedStyle(appWideStyles,1),

					titleBar: {...RelatedStyle(appWideStyles,0), headerRight: that.getHeaderRight(appWideStyles)}
				})
			})
		});
	}

	render () {
		return (<ImageBackground source={require('../assets/menu-bg.jpg')} style={styles.menuBg}>
			<FlatList
	          data={AppScreens} numColumns={2} key='grandMenu' columnWrapperStyle={styles.dataColumn}

	          style={{marginHorizontal: 20}} renderItem={function ({item: {name,route,icon, color}}, index) {

	          	return <TouchableHighlight key={index} style={{minWidth: '45%' }} underlayColor='transparent'

					onPress={() => {
						var {routeName, tempProps} = this.iconNavigate(route);

						this.props.navigation.navigate(routeName, tempProps);
					}}
				>
					<View style={[styles.menuCards, {backgroundColor: '#0009'}]}>
						<Icon name={icon} style={{fontSize:40, color: '#fff'}} />
						<Text style={{color: '#fff'}}>{name}</Text>
					</View>
				</TouchableHighlight>
	          }.bind(this)}
	        />
	    </ImageBackground>);
	}

	iconNavigate (routeName) {

	    var {globalStyles, contentHeader, titleBar} = this.state;
		
		return {
			routeName,

			tempProps:
				{
					bodyStyles: globalStyles, titleBar, contentHeader,

					dbRefresh: this.refreshStyles.bind(this)
				}
		};
	}

	getHeaderRight({headerTintColor}) {
		return <View style={styles.quickNav} key='quickNav'>
			{AppScreens.map(({icon, route},u) =>

				<Icon name={icon} key={'quickNav:'+u}

		  			onPress={() => this.iconNavigate(route)} style={{fontSize:20, color: headerTintColor, marginRight: 10}}
		  		/>
		  	)}
		</View>;
	}
}

const styles = StyleSheet.create({
  menuCards: {
    borderRadius: 10,
    flex: 1,
    minHeight: 150,
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
  },
  quickNav: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    paddingTop: 5,
  }
});