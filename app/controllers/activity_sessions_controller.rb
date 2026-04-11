# typed: strict

class ActivitySessionsController < ApplicationController
  extend T::Sig

  skip_after_action :verify_authorized, only: []
  before_action :set_household
  before_action :set_activity
  before_action :set_session, only: [:update, :destroy]

  sig { void }
  def create
    authorize ActivitySession
    result = CreateActivitySession.call(
      activity: @activity,
      scheduled_date: Date.parse(params.require(:scheduled_date)),
      status: params.fetch(:status, "confirmed"),
      start_time: params[:start_time].presence,
      end_time: params[:end_time].presence,
      notes: params[:notes].presence,
    )

    if result.success?
      redirect_to(household_activities_path(@household, week_start: params[:week_start]), notice: session_notice(params.fetch(:status, "confirmed")))
    else
      redirect_to(household_activities_path(@household, week_start: params[:week_start]), alert: result.errors.first)
    end
  end

  sig { void }
  def update
    authorize @session
    result = UpdateActivitySession.call(
      session: @session,
      scheduled_date: Date.parse(params.require(:scheduled_date)),
      start_time: params[:start_time].presence,
      end_time: params[:end_time].presence,
    )

    if result.success?
      redirect_to(household_activities_path(@household, week_start: params[:week_start]))
    else
      redirect_to(household_activities_path(@household, week_start: params[:week_start]), alert: result.errors.first)
    end
  end

  sig { void }
  def destroy
    authorize @session
    @session.destroy
    redirect_to(household_activities_path(@household, week_start: params[:week_start]), notice: "Session removed.")
  end

  private

  sig { params(status: String).returns(String) }
  def session_notice(status)
    status == "cancelled" ? "Occurrence cancelled." : "Session confirmed."
  end

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end

  sig { void }
  def set_activity
    @activity = @household.activities.find(params[:activity_id])
  end

  sig { void }
  def set_session
    @session = @activity.activity_sessions.find(params[:id])
  end
end
