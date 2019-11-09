/*
 * @Author: Alfred Yang
 * @Github: https://github.com/cat-walk
 * @Date: 2019-11-09 19:25:20
 * @LastEditors: Alfred Yang
 * @LastEditTime: 2019-11-09 19:25:26
 * @Description: file content
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class VoteResult extends Component {
  static propTypes = {
    prop: PropTypes
  }

  render() {
    return (
      <div>
        
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  
})

const mapDispatchToProps = {
  
}

export default connect(mapStateToProps, mapDispatchToProps)(VoteResult)
