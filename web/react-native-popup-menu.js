import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View} from 'react-native'

/**
 * Simple replacement for react-native-popup-menu in web.
 * It is not reusable since it works only with Info.js component.
 */

let lastMenuOptions = <div />

export const Menu = View
export const MenuOptions = (props) => {
  lastMenuOptions = props.children
  return <View />
}
export const MenuOption = View
export const MenuTrigger = View

const popupStyles = {flex: 1}

const menuActions = {
  openMenu: () => {
    // text from menu options in Info component
    const infoText = lastMenuOptions.props.children[0].props.children
    global.alert(infoText)
  },
  closeMenu: () => undefined,
}

export const withMenuContext = (Comp) => (props) => (
  <Comp {...props} ctx={{menuActions}} />
)

export class MenuProvider extends Component {
  getChildContext() {
    return {
      menuActions,
    }
  }
  render() {
    return <View style={popupStyles}>{this.props.children}</View>
  }
}

MenuProvider.childContextTypes = {
  menuActions: PropTypes.object,
}
