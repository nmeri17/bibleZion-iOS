import React, {Component} from 'react';

import { createStackNavigator, createAppContainer } from 'react-navigation';

import MemorizeScreen from './src/MemorizeScreen';

import MenuScreen from './src/MenuScreen';

import SaveScreen from './src/SaveScreen';

import SettingsScreen from './src/SettingsScreen';

import FinalContent from './src/FinalContent';



const MenuItems = createStackNavigator({
      // For each screen that you can navigate to, create a new entry like this:
      menu: {// access this through the state.routeName
        
        screen: MenuScreen,
      },
      SaveVerse: {
        // `SaveScreen` is a React component that will be the main content of the screen.
        screen: SaveScreen,
        // When `SaveScreen` is loaded by the StackNavigator, it will be given a `navigation` prop.

        // Optional: Override the `navigationOptions` for the screen
        navigationOptions: ({ navigation }) => ({
          title: 'Save a verse'
        }),
      },
      MemorizeVerse: {
        
        screen: MemorizeScreen,

        // Optional: When deep linking or using react-navigation in a web app, this path is used:
        // path: 'memorize/:folderName/:index',
        // The action and route params are extracted from the path.
        navigationOptions: ({ navigation }) => ({
          title: 'Memorize'
        }),
      },
      TestVerse: {
        
        screen: MemorizeScreen,
        params: {screenMode: 'test'},
        navigationOptions: ({ navigation }) => ({
          title: 'Test yourself',
        }),
      },
      SettingsVerse: {
        
        screen: SettingsScreen,
        navigationOptions: ({ navigation }) => ({
          title: 'Settings'
        }),
      },
      FinalScreen: {
        
        screen: FinalContent,
      },
    }, {headerMode : 'float'}),

// static defaultProps = {uriPrefix: Platform.OS == 'android' ? 'BibleZion://mychat/' : 'BibleZion://' }
App = createAppContainer(MenuItems);

export default App;
