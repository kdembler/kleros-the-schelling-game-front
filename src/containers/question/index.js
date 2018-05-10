import React, { PureComponent } from 'react'
import TelegramLoginButton from 'react-telegram-login'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { RenderIf } from 'lessdux'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import { toastr } from 'react-redux-toastr'
import { ClipLoader } from 'react-spinners'

import * as questionActions from '../../actions/question'
import * as voteActions from '../../actions/vote'

import './question.css'

const toastrOptions = {
  timeOut: 3000,
  showCloseButton: false
}

class Question extends PureComponent {
  state = {
    success: null,
    msg: true
  }

  static propTypes = {
    // Action Dispatchers
    fetchQuestion: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { fetchQuestion, profile } = this.props
    fetchQuestion(profile.address)
  }

  handleVote = voteId => e => {
    const { question, createVote } = this.props

    const profile = JSON.parse(localStorage.getItem('storageProfileSchellingGame'))

    createVote(profile.hash, question.data._id, voteId)
  }

  static propTypes = {}

  render() {
    const { msg } = this.state
    const { question, vote, profile } = this.props

    if (!profile.data) {
      return <Redirect to="/" />
    }

    if (question.data && question.data.msg && question.data.msg === 'You made 10 sessions. Try tomorrow.') {
      toastr.warning('You made 10 sessions. Try tomorrow.', toastrOptions)
      return <Redirect to={`/scores`} />
    }

    if (question.data && (question.data.msg && question.data.msg === 'no question' || question.data.msg === 'You have answered all the questions. You can try tomorrow or add new question.')) {
      toastr.success("Kudos! You have answered all the questions!", toastrOptions)
      return <Redirect to={`/scores`} />
    }

    if (vote.data && vote.data.result === 'loose') {
      toastr.info('Lost. You are not in the Schelling Point', toastrOptions)
      return <Redirect to={`/scores?msg=loose&username=${profile.username}#target`} />
    }

    return (
      <div className="Question">
        <RenderIf
          resource={question}
          done={
            question.data && question.data.question ? (
              <div className="proposals">
                {question.data.proposals.map((p, index) => (
                  <div className="proposal">
                    <button
                      key={index}
                      onClick={this.handleVote(index)}
                    >
                      {p}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div></div>
            )
          }
          failedLoading={<span />}
          loading={
            <div className="loader">
              <ClipLoader color={'gray'} loading={true} />
            </div>
          }
        />
      </div>
    )
  }
}

export default connect(
  state => ({
    question: state.question.question,
    vote: state.vote.vote,
    profile: state.profile.profile
  }),
  {
    fetchQuestion: questionActions.fetchQuestion,
    createVote: voteActions.createVote
  }
)(Question)
