class Api::SubjectsController < ApplicationController
  def index
    @subjects = Subject.all
    render "api/subjects/index"
  end

  def create
    course = Course.where(name: subject_params[:courseName])
    courseIdd = course.first.id
    
    @subject = Subject.new( name: subject_params[:name],authorId: subject_params[:authorId],courseId: courseIdd)

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
    # course = Course.find(subject_params[:courseId])
    # courseName = course[:name]
    @subject = Subject.find(params[:id])
    p (1111111111111111111111111111111111111111111)
    p (@subject)
    p (subject_params)
    p (1111111111111111111111111111111111111111111)
    # if @subject.update(subject_params)
    if @subject
      @subject.update(name: subject_params[:name], authorId: subject_params[:authorId], courseId: subject_params[:courseId])
      render :show
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
      params.require(:subject).permit(:id,:name,:authorId,:courseId,:courseName)
  end

end