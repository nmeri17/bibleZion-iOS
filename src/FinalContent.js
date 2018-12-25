import React, {Component} from 'react';

import { Text, TextInput, View, StyleSheet, SectionList, } from 'react-native';

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

			titleBar: params.titleBar, contentHeader: params.contentHeader,
		};
	}

	static defaultProps = {
	  screenMap: {folders: 'folderName', verses: 'quotation', lastStep: true}, // screen title per `mode`

	  iconsMap: {folders: 'md-folder', verses: 'md-paper'},
	}

	static navigationOptions = ({ navigation }) => {
	    return navigation.state.params.titleBar;
	};

    componentWillReceiveProps(nextProps) {
  		var {navigation: {state: {params}}} = nextProps;
		
		this.setState({globalStyles: params.bodyStyles, contentHeader: params.contentHeader,
			
			titleBar: params.titleBar
		});
    }

	render() {
		var {globalStyles, contentHeader, titleBar, modalChild} = this.state,

		{navigation: {state: {params}}} = this.props;

		if (params.screenMode == 'test') { // source: navigation wrapper or caller

			var contextView = params.target[params.itemIndx], testTitle = params.target.quotation,

			childCloseToggle= this.testVerseAssert.bind(this);
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

			formattedComponents={contextView} testTitle={testTitle}

			modalChild={this.state.modalChild} noDiff={this.state.res1} noDiff2={this.state.res2}

			bodyStyles={globalStyles} contentHeader={contentHeader}

			onChildModalClose={childCloseToggle} titleBar={titleBar}			
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

			if (!noDiff) return {modalChild: 1, childCloseToggle: () => console.log('is a close handler still necessary?'/*this.fetchFreshFolders.bind(this)*/)};

			else return {modalChild: 2, res1: noDiff, res2: noDiff2, childCloseToggle: () => console.log('is a close handler still necessary?'/*this.fetchFreshFolders.bind(this)*/)};
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
});