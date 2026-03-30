# typed: strict

class ActivitiesController < ApplicationController
  extend T::Sig
  include HouseholdProps

  ActivityChildPropShape = T.type_alias { { id: Integer, first_name: String, age: Integer } }
  ActivityPropShape = T.type_alias {
    {
      id: Integer, name: String, location_name: T.nilable(String), address: T.nilable(String),
      latitude: T.nilable(Float), longitude: T.nilable(Float), day_of_week: T.nilable(Integer),
      day_of_week_name: T.nilable(String), start_time: T.nilable(String), end_time: T.nilable(String),
      duration_minutes: T.nilable(Integer), recurrence: String, starts_on: T.nilable(String),
      notes: T.nilable(String), children: T::Array[ActivityChildPropShape],
      created_at: T.nilable(ActiveSupport::TimeWithZone), updated_at: T.nilable(ActiveSupport::TimeWithZone)
    }
  }

  before_action :set_household
  before_action :set_activity, only: [:show, :edit, :update, :destroy]

  sig { void }
  def index
    authorize Activity
    activities = @household.activities.includes(:children).order(:day_of_week, :start_time)

    render(inertia: "Activities/Index", props: {
      household: household_props(@household),
      activities: activities.map { |a| activity_props(a) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def show
    authorize @activity
    render(inertia: "Activities/Show", props: {
      household: household_props(@household),
      activity: activity_props(@activity),
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def new
    authorize Activity
    render(inertia: "Activities/New", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: Activity.defaults,
      errors: {},
    })
  end

  sig { void }
  def edit
    authorize @activity
    render(inertia: "Activities/Edit", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: activity_props(@activity).merge(child_ids: @activity.children.pluck(:id)),
      errors: {},
    })
  end

  def create
    @activity = @household.activities.build(activity_params)
    authorize @activity

    if @activity.save
      child_ids = Array(params.dig(:activity, :child_ids)).map(&:to_i)
      SyncActivityChildren.call(activity: @activity, child_ids: child_ids, household: @household)
      redirect_to(household_activity_path(@household, @activity), notice: "Activity created.")
    else
      render(inertia: "Activities/New", props: {
        household: household_props(@household),
        children: @household.children.map { |c| child_props(c) },
        activity: Activity.defaults,
        errors: @activity.errors.as_json,
      })
    end
  end

  sig { void }
  def update
    authorize @activity
    if @activity.update(activity_params)
      child_ids = Array(params.dig(:activity, :child_ids)).map(&:to_i)
      SyncActivityChildren.call(activity: @activity, child_ids: child_ids, household: @household)
      redirect_to(household_activity_path(@household, @activity), notice: "Activity updated.")
    else
      render(inertia: "Activities/Edit", props: {
        household: household_props(@household),
        children: @household.children.map { |c| child_props(c) },
        activity: activity_props(@activity).merge(child_ids: @activity.children.pluck(:id)),
        errors: @activity.errors.as_json,
      })
    end
  end

  sig { void }
  def destroy
    authorize @activity
    @activity.destroy
    redirect_to(household_activities_path(@household), notice: "Activity deleted.")
  end

  private

  sig { void }
  def set_household
    @household = current_user.households.find(params[:household_id])
  end

  sig { void }
  def set_activity
    @activity = @household.activities.find(params[:id])
  end

  sig { returns(ActionController::Parameters) }
  def activity_params
    params.expect(
      activity: [
        :name,
        :location_name,
        :address,
        :latitude,
        :longitude,
        :day_of_week,
        :start_time,
        :end_time,
        :duration_minutes,
        :recurrence,
        :starts_on,
        :notes,
      ],
    )
  end

  sig { params(activity: Activity).returns(ActivityPropShape) }
  def activity_props(activity)
    {
      id: activity.id,
      name: activity.name,
      location_name: activity.location_name,
      address: activity.address,
      latitude: activity.latitude,
      longitude: activity.longitude,
      day_of_week: activity.day_of_week,
      day_of_week_name: activity.day_of_week_name,
      start_time: activity.start_time&.strftime("%H:%M"),
      end_time: activity.end_time&.strftime("%H:%M"),
      duration_minutes: activity.duration_minutes,
      recurrence: activity.recurrence,
      starts_on: activity.starts_on,
      notes: activity.notes,
      children: activity.children.map { |c| { id: c.id, first_name: c.first_name, age: c.age } },
      created_at: activity.created_at,
      updated_at: activity.updated_at,
    }
  end
end
