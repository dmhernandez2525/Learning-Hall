class Api::TasksController < ApplicationController
  
  def index
    @tasks = Tasks.all
    render "api/tasks/index"
  end

  def create
    @tasks = Tasks.new(tasks_params)
    if @tasks.save
      render "api/tasks/show"
    else
      render json: @tasks.errors.full_messages,status: 404
    end
  end
  
  def show
    @tasks = Tasks.find(params[:id])
    render "api/tasks/show"
  end

  def update
    @tasks = Tasks.find(params[:id])
    if @tasks.update(tasks_params)
      render "api/tasks/show"
    else
      render json: @tasks.errors.full_messages, status: 422
    end

  end

  def destroy
    @tasks = Tasks.find(params[:id])

    if @tasks.destroy
      render json: params[:id]
    else
      render json: @tasks.errors.full_messages, status: 422
    end

  end

  private 
  def tasks_params
      params.require(:task).permit(:name, :authorId, :courseId, :completed, :duration, :body)
  end
end
