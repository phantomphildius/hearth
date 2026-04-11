class InvitationMailer < ApplicationMailer
  def invite(user, household)
    @user = user
    @household = household
    @sign_in_url = new_user_session_url

    mail(
      to: @user.email,
      subject: "You've been invited to #{@household.name} on Hearth",
    )
  end
end
