import React, {Component} from 'react';

import { Text, TextInput, View, StyleSheet, SectionList, TouchableOpacity, ImageBackground, } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import { IndicatorViewPager, PagerDotIndicator} from 'rn-viewpager';

import store from 'react-native-simple-store';

import FolderComp from './FolderComp';

import {BadToGood, GoodToBad} from './diffInText';


export default class FinalContent extends React.Component {

	constructor (props) {
		super(props);

		var {navigation: {state: {params}}} = props;

		this.state = {modalChild: null, res2: null, res1: null, globalStyles: params.bodyStyles,

			titleBar: params.titleBar, contentHeader: params.contentHeader, childCloseToggle: null,

			displayMemo: false,
		};
	}

	static navigationOptions = ({ navigation }) => {

		var newParams = {};

		Object.assign(newParams, navigation.state.params.titleBar, {headerRight: null});

	    return newParams;
	};

    componentWillReceiveProps(nextProps) {
  		var {navigation: {state: {params}}} = nextProps;
		
		this.setState({globalStyles: params.bodyStyles, contentHeader: params.contentHeader,
			
			titleBar: params.titleBar
		});
    }

	render() {
		var {globalStyles, contentHeader, titleBar, modalChild, displayMemo} = this.state,

		{navigation: {state: {params}}} = this.props, that = this, {backgroundColor, color, fontSize} = globalStyles;

		if (params.screenMode == 'test') { // source: navigation wrapper or caller

			var targetObj = params.target[params.itemIndx], fzContent = {fontSize: fontSize > 15

				? fontSize > 20? fontSize-10: fontSize- 5
				: fontSize}, contextView = <View key='testView'

			style={{paddingHorizontal: 15}}>
				
				<Text style={[contentHeader, {fontSize: fontSize}]}>Title</Text>
				
				<Text style={[fzContent, {marginBottom: 15, left: 5, color: globalStyles.color}]}>{targetObj.quotation}</Text>

				<View>
					<Text style={[contentHeader, {fontSize: fontSize}]}>Reading</Text>

					<TextInput multiline={true} style={[styles.testBox, fzContent]} placeholder='Type here' ref='testBox'

		    			style={{color: globalStyles.color}} autoCapitalize='sentences' autoCorrect={true}

		    			placeholderTextColor={globalStyles.color}
		    		/>
					
					<TouchableOpacity onPress={() => {
						var userInput = that.refs.testBox._lastNativeText;

						if (userInput !== void(0)) that.testVerseAssert(userInput);
					}}

		    			style={[{ backgroundColor: color}, styles.checkButton] }>
		    			
		    			<Text style={{color:backgroundColor}}>Check</Text>
		    		</TouchableOpacity>
				</View>
			</View>
		}

		else {
			// load all screens for swiping through
			var allScreens = params.target.map((obj,n) => 
				(<View>
					<ImageBackground source={require('../assets/IMG-20181130-WA0006.jpg')} style={styles.parchment}>
						<View><SectionList
							renderItem={({item, index, separators}) => item}
		  
		  					renderSectionHeader={({section: {title}}) => (
		    			
		    					<Text style={[ {fontSize: fontSize, fontFamily: 'Times New Roman'}]}>{title}</Text>
		  					)}

		  					sections={[
								{title: 'Quotation', data: [

									<Text style={styles.memoData}

										onPress={() => that.setState({displayMemo: !displayMemo})}
									>
										{ !displayMemo ? 'Tap to show ' + obj.quotation: 'Hide ' + obj.quotation}

									</Text>
								]},
								{title: 'Reading', data: [<Text style={[styles.memoData, {display: displayMemo ? 'flex': 'none'}]}>

									{obj.text}</Text>]
								},
							]} key={n} style={[{minHeight:400, flex: 1}, globalStyles, {backgroundColor: 'transparent'}]}

							keyExtractor={(item, index) => 'lastVisited:' + index}
						/></View>
					</ImageBackground>
				</View>)
			);

			contextView = <IndicatorViewPager key='cv'
				initialPage={params.itemIndx}
				indicator={<PagerDotIndicator pageCount={allScreens.length-1}

					dotStyle={{backgroundColor: '#fff'}}
					
					selectedDotStyle={{backgroundColor: color}}
				/>}
				style={{minHeight:200,flex:1}}
			>
				{allScreens}
			</IndicatorViewPager>;
		}

		return <FolderComp

			formattedComponents={contextView} noDiff={this.state.res1} noDiff2={this.state.res2}

			modalChild={this.state.modalChild} contentHeader={contentHeader} titleBar={titleBar}

			bodyStyles={globalStyles} onChildModalClose={this.state.childCloseToggle}
		/>;
	}


	// state change on FolderComp triggers update here
	testVerseAssert (userInput) {

		var {target, itemIndx} = this.props.navigation.state.params;// check last clicked verse

		target = target[itemIndx].text.trim();

		// update state to display modal
		this.setState((state, props) => {

			var noDiff = GoodToBad(userInput.trim(), target, [styles.correctText, {fontWeight: '700'}]),

			noDiff2 = BadToGood(target, userInput.trim(), [styles.nullText, {fontWeight: '700'}]);

			if (!noDiff) return {modalChild: 1, childCloseToggle: () => props.navigation.goBack()};

			else return {modalChild: 2, res1: noDiff, res2: noDiff2, childCloseToggle: null};
		});
	}
}

const styles = StyleSheet.create({
	nullText: {
		color: 'red',
	},
	correctText: {
		color: 'green',
	},
	testBox: {
		height: 60
	},
	checkButton: {
	  	marginHorizontal: 5,
	  	paddingVertical: 10,
	  	paddingHorizontal: 5,
	  	borderRadius: 5,
	},
  parchment: {
  	flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
    paddingTop:20,
    paddingHorizontal: 15
  },
  memoData:{
  	marginBottom:10,
  	fontFamily: 'Times New Roman',
  }
});