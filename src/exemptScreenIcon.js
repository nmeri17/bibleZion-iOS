import React from 'react';

import { AppScreens, } from './app-wide-styling';


// EXEMPT SCREEN ICON WHEN ON ITS PAGE
function ExemptScreenIcon ({navigation, titleBar, nextIconExemptIndex}) {

	// check if header bar has been wrapped on memorize screen
	var currHR = titleBar.headerRight && titleBar.headerRight.key == 'mergedNav' ? titleBar.headerRight.props.children[0]: titleBar.headerRight,

	prevIcon = navigation.getParam('lastIconExempt',false), lastIconExempt, newParams;
	
	if (currHR !== void(0)) {

		// if theres a prevIcon and hes not us, add him before rearranging the ordering of children
		if (prevIcon && !prevIcon.key.includes(nextIconExemptIndex)) {

			var prevIconInd = navigation.getParam('nextIconExemptIndex'),

			noDupli = currHR.props.children.every(g => !g.key.includes(prevIconInd));

			// we only ever want a list of 3 icons
			if ( noDupli && currHR.props.children.length === 3 ) {

				currHR.props.children.splice(prevIconInd,0, prevIcon);

				lastIconExempt = currHR.props.children.splice(nextIconExemptIndex,1)[0];

				newParams = {lastIconExempt, nextIconExemptIndex};

				// reattach listeners
				currHR.props.children.forEach((w,b) => {

					var scrId = +w.key.slice(-1), tempProps = navigation.state.params,

					// was spliced & thus still returns the obj given by menu screen
					menuFirstClick = w.props.onPress.toString().includes('iconNavigate'), routeName = AppScreens[scrId].route
 
					screenMode = tempProps.screenMode == 'test' && routeName == 'TestVerse' ? 'test': void(0);

					
					if (menuFirstClick) currHR.props.children[b] = React.cloneElement(w, {

						onPress: () => navigation.navigate(
							routeName,

							{...w.props.onPress().tempProps, ...newParams}
						)
					});

					else currHR.props.children[b] = React.cloneElement(w, {
						onPress: () => navigation.navigate(
							routeName,

							{...tempProps, ...newParams, screenMode} // extend existing param list
						)
					});
				});
			}
			/*else console.log( nextIconExemptIndex,prevIconInd, ...currHR.props.children)
			// who are the dupli? whos trying to get in?*/
		}

		// if we're guarded against infinite state change
			// (splice us, set us as new prevIcon, attach listeners)
		// runs only the first time
		else if (

			currHR.props.children[nextIconExemptIndex] !== void(0) &&

			currHR.props.children[nextIconExemptIndex].key.includes(nextIconExemptIndex)
		) {

			lastIconExempt = currHR.props.children.splice(nextIconExemptIndex,1)[0];
			
			newParams = {lastIconExempt, nextIconExemptIndex};

			var {tempProps} = lastIconExempt.props.onPress();

			if (tempProps !== void(0)) {
				
				// modify icons event listener
				currHR.props.children.forEach((w,b) => {
					var {routeName, tempProps} = w.props.onPress();

					currHR.props.children[b] = React.cloneElement(w, {

						onPress: () => navigation.navigate(routeName, {...tempProps, ...newParams})
					});
				});
			}
		}
	}

	else console.log(arguments);

	return currHR;
}


export default ExemptScreenIcon;