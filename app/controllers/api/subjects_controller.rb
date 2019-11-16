class Api::SubjectsController < ApplicationController
  def index
    @subjects = Subject.all
    render "api/subjects/index"
  end

  def create
    course = Course.where(name: subject_params[:courseName])
    courseIdd = course.first.id

      subject =  {
        name: subject_params[:name],
        authorId: subject_params[:authorId],
        courseId: courseIdd
      }
    @subject = Subject.new( name: subject_params[:name],authorId: subject_params[:authorId],courseId: courseIdd)
    p (1111111111111111111111111111111111111)
    p (courseIdd)
    p (1111111111111111111111111111111111111)
    p (2222222222222222222222222222222222222)
    p (@subject)
    p (2222222222222222222222222222222222222)
    
    # @subject = Subject.new(subject_params)
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
      params.require(:subject).permit(:name,:authorId,:courseId,:courseName)
  end

end