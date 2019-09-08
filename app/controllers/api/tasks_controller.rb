class Api::TasksController < ApplicationController
  
  def index
    @tasks = Task.all
    render "api/tasks/index"
  end

  def create
    @task = Task.new(task_params)
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
      params.require(:task).permit(:name, :author_id, :subject_id, :completed, :duration, :body)
  end
end
