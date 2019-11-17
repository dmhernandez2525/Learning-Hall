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
    p (11111111111111111111111111111111)
    p (@task[:author_id])
    p (11111111111111111111111111111111)

    if @task
       @task.update(name: task_params[:name], duration: task_params[:duration], body: task_params[:body],completed: true,author_id:@task[:author_id],subject_id: @task[:subject_id])
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
      params.require(:task).permit(:id,:name, :author_id, :completed, :duration, :body,:subjectName)
    # params.require(:task).permit(:name, :author_id, :subject_id, :completed, :duration, :body,:subjectName)
  end
end
