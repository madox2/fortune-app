import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Text, TouchableOpacity, Platform} from 'react-native'
import {
  Menu,
  MenuTrigger,
  MenuOption,
  MenuOptions,
  withMenuContext,
} from 'react-native-popup-menu'
import {ResponsiveStyleSheet} from 'react-native-responsive-stylesheet'
import {InfoButton} from './InfoButton'
import {storage} from '../services/storage'

class InfoComponent extends Component {
  constructor(...args) {
    super(...args)
    this.dismiss = this.dismiss.bind(this)
    this.openMenu = this.openMenu.bind(this)
  }

  componentDidMount() {
    const {type} = this.props
    const dismissedVersion = storage.getNumber(`Info.${type}.dismissedVersion`)
    const currentVersion = storage.getNumber(`Info.${type}@version`)
    // show popup only first time and in new version
    if (dismissedVersion === currentVersion || Platform.OS === 'web') {
      return
    }
    requestAnimationFrame(() => {
      this.props.ctx.menuActions.openMenu('info')
      storage.set(`Info.${type}.dismissedVersion`, currentVersion)
    })
  }

  openMenu() {
    this.props.ctx.menuActions.openMenu('info')
  }

  dismiss() {
    this.props.ctx.menuActions.closeMenu()
  }

  render() {
    const {type, buttonColor} = this.props
    const s = makeStyles()
    return (
      <Menu name="info">
        <MenuTrigger>
          <InfoButton
            onPress={this.openMenu}
            type="help"
            backgroundColor={buttonColor}
          />
        </MenuTrigger>
        <MenuOptions customStyles={{optionsContainer: s.options}}>
          <MenuOption style={s.option}>
            <Text style={s.text}>{storage.get(`Info.${type}`)}</Text>
            <TouchableOpacity onPress={this.dismiss}>
              <Text style={s.dismiss}>dismiss...</Text>
            </TouchableOpacity>
          </MenuOption>
        </MenuOptions>
      </Menu>
    )
  }
}

InfoComponent.propTypes = {
  ctx: PropTypes.object,
}

const makeStyles = ResponsiveStyleSheet.create(() => ({
  options: {
    borderRadius: 20,
    borderTopRightRadius: 0,
  },
  option: {
    padding: 13,
    paddingTop: 18,
  },
  text: {
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  dismiss: {
    marginTop: 20,
    lineHeight: 24,
    fontSize: 16,
    textAlign: 'right',
    color: '#6495ed',
  },
}))

export const Info = withMenuContext(InfoComponent)
