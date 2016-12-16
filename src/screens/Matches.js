import React, { Component } from 'react'
import { Image, View, Animated, PanResponder } from 'react-native'
import { randomNumber } from '../utils/random'
import { SectionTemplate } from '../components/SectionTemplate'
import { ResponsiveStyleSheet } from 'react-native-responsive-stylesheet'
import { resource } from '../utils/image'
import { storage } from '../services/storage'

const makeOptions = count => ({
  count: {
    type: 'number',
    label: 'Count',
    defaultValue: count || 4,
    constraints: { min: 2, max: 8 },
  },
})

const matchSource = resource('images/match.png')
const matchBurnedSource = resource('images/match-burned.png')

const MIN_PULL_LENGTH = 10

export class Matches extends Component {

  constructor(...args) {
    super(...args)
    this.options = makeOptions(storage.get('Matches.count'))
    const count = this.options.count.defaultValue
    this.state = {
      count,
      matches: this.getNewStates(count),
      selected: randomNumber(0, count - 1),
      throwNumber: 0,
    }
    this.onRefresh = this.onRefresh.bind(this)
    this.onOptionsChange = this.onOptionsChange.bind(this)
  }

  computePosition(y0, y) {
    let pos = y - y0 + this.lowerPosition
    pos < this.upperPosition && (pos = this.upperPosition)
    pos > this.lowerPosition && (pos = this.lowerPosition)
    return pos
  }

  makeMatchPanResponder(position, idx) {
    const isPulled = () => this.state.matches.find((a, i) => i === idx).pulled
    return createPanResponder({
      onStart: () => true,
      onMove: state => {
        if (isPulled()) {
          return
        }
        position.setValue(this.computePosition(state.y0, state.moveY))
      },
      onEnd: state => {
        if (isPulled()) {
          return
        }
        const pos = this.computePosition(state.y0, state.moveY)
        if (pos > this.lowerPosition - MIN_PULL_LENGTH) {
          position.setValue(this.lowerPosition)
          return
        }
        this.showMatch(idx, position)
      },
    })
  }

  getNewStates(count) {
    return new Array(count)
      .fill(false)
      .map((v, idx) => {
        const pulled = false
        const position = new Animated.Value(this.lowerPosition)
        const panResponder = this.makeMatchPanResponder(position, idx)
        return { pulled, position, panResponder }
      })
  }

  onRefresh() {
    const { count } = this.state
    const selected = randomNumber(0, count - 1)
    this.setState({ selected, matches: this.getNewStates(count) })
  }

  onOptionsChange({ count }) {
    const selected = randomNumber(0, count.value - 1)
    storage.set('Matches.count', count.value)
    this.setState({
      count: count.value,
      matches: this.getNewStates(count.value),
      selected,
    })
  }

  showMatch(idx, position) {
    Animated.timing(position, {
      toValue: this.upperPosition,
      duration: 200,
    }).start(() => {
      this.setState({
        matches: this.state.matches.map((s, i) => i !== idx ? s : {
          ...s, pulled: true,
        }),
      })
    })
  }

  updateLayoutProperties(state) {
    const {
      contentHeight,
      controlsHeight,
      settingsHeight,
    } = ResponsiveStyleSheet.getProperties()
    const availableHeight = contentHeight - controlsHeight - settingsHeight
    this.matchHeight = Math.min(300, availableHeight * 0.83)
    const pullHeight = Math.min(availableHeight - this.matchHeight, this.matchHeight / 4)
    this.lowerPosition = -Math.max((availableHeight - this.matchHeight - pullHeight) / 2)
    this.upperPosition = this.lowerPosition - pullHeight
    state.matches.forEach(m => {
      m.position.setValue(m.pulled ? this.upperPosition : this.lowerPosition)
    })
  }

  componentWillMount() {
    this.updateLayoutProperties(this.state)
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateLayoutProperties(nextState)
  }

  render() {
    const { throwNumber, matches, selected } = this.state
    const s = makeStyles({ matchHeight: this.matchHeight, matchCount: matches.length })
    return (
      <SectionTemplate
        onRefresh={this.onRefresh}
        options={this.options}
        onOptionsChange={this.onOptionsChange}
        title='Matches'
        color={this.props.color}
        buttonColor={this.props.buttonColor}
      >
        <View style={s.container}>
          {matches.map((match, i) => (
            <Animated.View
              key={`${throwNumber}-${i}`}
              {...match.panResponder.panHandlers}
              style={[s.imageContainer, {
                transform: [{ translateY: match.position }],
              }]}
            >
              <Image
                style={s.imageMatch}
                source={match.pulled && i === selected ? matchBurnedSource : matchSource}
              />
            </Animated.View>
          ))}
        </View>
      </SectionTemplate>
    )
  }

}

const makeStyles = ResponsiveStyleSheet.create(({
  contentWidth,
  controlsHeight,
  matchHeight,
  contentPadding,
  matchCount,
}) => {
  const matchWidth = matchHeight / 10.14
  let matchPadding = contentWidth * 0.02
  if (matchCount * (matchWidth + 2 * matchPadding) > contentWidth) {
    matchPadding = (contentWidth - matchCount * matchWidth) / matchCount / 2
  }
  return ({
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: controlsHeight + contentPadding,
    },
    imageContainer: {
      paddingLeft: matchPadding,
      paddingRight: matchPadding,
      height: matchHeight,
    },
    imageMatch: {
      position: 'relative',
      resizeMode: 'stretch',
      height: matchHeight,
      width: matchWidth,
      bottom: 0,
    },
  })
})

const createPanResponder = ({ onStart, onMove, onEnd, onStartShouldSetPanResponder }) => PanResponder.create({
  onStartShouldSetPanResponder: onStartShouldSetPanResponder,
  onStartShouldSetPanResponderCapture: () => true,
  onPanResponderTerminationRequest: () => true,
  onPanResponderGrant: (evt, state) => onStart(state),
  onPanResponderMove: (evt, state) => onMove(state),
  onPanResponderRelease: (evt, state) => onEnd(state),
})
