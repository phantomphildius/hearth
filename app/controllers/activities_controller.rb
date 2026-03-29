# typed: strict

class ActivitiesController < ApplicationController
  extend T::Sig

  before_action :set_household
  before_action :set_activity, only: [:show, :edit, :update, :destroy]

  sig { void }
  def index
    activities = @household.activities.includes(:children).order(:day_of_week, :start_time)

    render(inertia: "Activities/Index", props: {
      household: household_props(@household),
      activities: activities.map { |a| activity_props(a) },
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def show
    render(inertia: "Activities/Show", props: {
      household: household_props(@household),
      activity: activity_props(@activity),
      children: @household.children.map { |c| child_props(c) },
    })
  end

  sig { void }
  def new
    render(inertia: "Activities/New", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: activity_defaults,
      errors: {},
    })
  end

  sig { void }
  def edit
    render(inertia: "Activities/Edit", props: {
      household: household_props(@household),
      children: @household.children.map { |c| child_props(c) },
      activity: activity_props(@activity).merge(child_ids: @activity.children.pluck(:id)),
      errors: {},
    })
  end

  def create
    @activity = @household.activities.build(activity_params)

    if @activity.save
      sync_children(@activity, params[:activity][:child_ids])
      redirect_to(household_activity_path(@household, @activity), notice: "Activity created.")
    else
      render(inertia: "Activities/New", props: {
        household: household_props(@household),
        children: @household.children.map { |c| child_props(c) },
        activity: activity_defaults,
        errors: @activity.errors.as_json,
      })
    end
  end

  sig { void }

  sig { void }
  def update
    if @activity.update(activity_params)
      sync_children(@activity, params[:activity][:child_ids])
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

  sig { params(activity: Activity, child_ids: T.untyped).void }
  def sync_children(activity, child_ids)
    return if child_ids.blank?

    valid_ids = @household.children.where(id: child_ids).pluck(:id)
    activity.children = Child.where(id: valid_ids)
  end

  sig { params(household: Household).returns(T::Hash[Symbol, T.untyped]) }
  def household_props(household)
    { id: household.id, name: household.name }
  end

  sig { params(child: Child).returns(T::Hash[Symbol, T.untyped]) }
  def child_props(child)
    { id: child.id, first_name: child.first_name, date_of_birth: child.date_of_birth, age: child.age }
  end

  sig { params(activity: Activity).returns(T::Hash[Symbol, T.untyped]) }
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

  sig { returns(T::Hash[Symbol, T.untyped]) }
  def activity_defaults
    {
      name: "",
      location_name: "",
      address: "",
      latitude: nil,
      longitude: nil,
      day_of_week: nil,
      start_time: "",
      end_time: "",
      duration_minutes: nil,
      recurrence: "weekly",
      starts_on: "",
      notes: "",
      child_ids: [],
    }
  end
end
