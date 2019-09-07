class Api::CoursesController < ApplicationController
  def index
    @courses = Course.all
    render "api/courses/index"
  end

  def create
    @course = Course.new(course_params)
    if @course.save
      render "api/courses/show"
    else
      render json: @course.errors.full_messages,status: 404
    end
  end
  
  def show
    @course = Course.find(course_params[:id])
    render "api/courses/show"
  end

  def update
    @course = Course.find(course_params[:id])
    if @course.update(course_params)
      render "api/courses/show"
    else
      render json: @course.errors.full_messages, status: 422
    end

  end

  def destroy
    @course = Course.find(course_params[:id])

    if @course.distroy
      render json: course_params[:id]
    else
      render json: @course.errors.full_messages, status: 422
    end

  end

  private 
  def course_params
      params.require(:course).permit(:name,:author_id)
  end

end
