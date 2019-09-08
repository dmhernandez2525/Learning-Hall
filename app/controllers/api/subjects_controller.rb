class Api::SubjectsController < ApplicationController
  def index
    @subjects = Subject.all
    render "api/subjects/index"
  end

  def create
    @subject = Subject.new(subject_params)
    if @subject.save
      render "api/subjects/show"
    else
      render json: @subject.errors.full_messages,status: 404
    end
  end
  
  def show
    @subject = Subject.find(params[:id])
    render "api/subjects/show"
  end

  def update
    @subject = Subject.find(params[:id])
    if @subject.update(subject_params)
      render "api/subjects/show"
    else
      render json: @subject.errors.full_messages, status: 422
    end

  end

  def destroy
    @subject = Subject.find(params[:id])

    if @subject.destroy
      render json: params[:id]
    else
      render json: @subject.errors.full_messages, status: 422
    end

  end

  private 
  def subject_params
      params.require(:subject).permit(:name,:author_id,:course_id)
  end

end