class Api::TasksController < ApplicationController

  def index
    sleep 1  
    @tasks = Task.all
    render "api/tasks/index"
  end

  def create
    subject = Subject.where(name: task_params[:subjectName])
    subjectIdd = subject.first.id
    @task = Task.new( name: task_params[:name],author_id: task_params[:author_id],body: task_params[:body], duration:task_params[:duration],subject_id: subjectIdd,completed: true)
    p (1111111111111111111111111111111111111)
    p (subjectIdd)
    p (1111111111111111111111111111111111111)
    p (2222222222222222222222222222222222222)
    p (@task)
    p (2222222222222222222222222222222222222)

    # @task = Task.new(task_params)
    if @task.save
      render "api/tasks/show"
    else
      render json: @task.errors.full_messages,status: 404
    end
  end

  def show
    @task = Task.find(params[:id])
    render "api/tasks/show"
  end

  def update
    @task = Task.find(params[:id])
    if @task.update(task_params)
      render "api/tasks/show"
    else
      render json: @task.errors.full_messages, status: 422
    end

  end

  def destroy
    @task = Task.find(params[:id])

    if @task.destroy
      render json: params[:id]
    else
      render json: @task.errors.full_messages, status: 422
    end

  end

  private 
  def task_params
      params.require(:task).permit(:name, :author_id, :subject_id, :completed, :duration, :body,:subjectName)
  end
end
