import React, {Component} from 'react';

import { Text, TextInput, View, StyleSheet, SectionList, TouchableOpacity} from 'react-native';

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

			titleBar: params.titleBar, contentHeader: params.contentHeader, childCloseToggle: null
		};
	}

	static defaultProps = {
	  screenMap: {folders: 'folderName', verses: 'quotation', lastStep: true}, // screen title per `mode`

	  iconsMap: {folders: 'md-folder', verses: 'md-paper'},
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
		var {globalStyles, contentHeader, titleBar, modalChild} = this.state,

		{navigation: {state: {params}}} = this.props, that = this;

		if (params.screenMode == 'test') { // source: navigation wrapper or caller

			var targetObj = params.target[params.itemIndx], contextView = <View key='testView'>
				
				<Text style={contentHeader}>title</Text>
				
				<Text>{targetObj.quotation}</Text>

				<View>
					<TextInput multiline={true} style={styles.testBox} placeholder='reading' ref='testBox'/>
					
					<TouchableOpacity onPress={() => {
						var userInput = that.refs.testBox._lastNativeText;

						if (userInput !== void(0)) that.testVerseAssert(userInput);
					}}

		    			style={[{ backgroundColor: globalStyles.color}, styles.checkButton] }>
		    			
		    			<Text style={{color:globalStyles.backgroundColor}}>Check</Text>
		    		</TouchableOpacity>
				</View>
			</View>
		}

		else {
			// load all screens for swiping through
			var allScreens = params.target.map((obj,n) => 
				(<View><SectionList
					renderItem={({item, index, separators}) => item}
  
  					renderSectionHeader={({section: {title}}) => (
    			
    					<Text style={contentHeader}>{title}</Text>
  					)}

  					sections={[
						{title: 'Title', data: [<Text style={{marginBottom:10}}>{obj.quotation} </Text>]},
						{title: 'Reading', data: [<Text style={{marginBottom:10}}>{obj.text}</Text>]},
					]} key={n} style={[{minHeight:400, flex: 1}, globalStyles]}

					keyExtractor={(item, index) => 'lastVisited:' + index}
				/></View>)
			),

			{backgroundColor, color} = globalStyles;

			contextView = <IndicatorViewPager key='cv'
				initialPage={params.itemIndx}
				indicator={<PagerDotIndicator pageCount={allScreens.length-1}

					dotStyle={{backgroundColor: '#000'}}
					
					selectedDotStyle={{backgroundColor: color}}
				/>}
				style={{minHeight:200,flex:1, paddingTop:20, backgroundColor: backgroundColor,
					paddingHorizontal: 15}}
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

			var noDiff = GoodToBad(userInput.trim(), target, styles.correctText),

			noDiff2 = BadToGood(target, userInput.trim(), styles.nullText);

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
});