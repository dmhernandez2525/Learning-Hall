# == Schema Information
#
# Table name: users
#
#  id              :bigint           not null, primary key
#  username        :string           not null
#  email           :string           not null
#  password_digest :string           not null
#  session_token   :string           not null
#  preferred_name  :string
#  user_role       :string           not null
#  pronunciation   :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class User < ApplicationRecord
    validates :username, :email, :session_token, :password_digest , :user_role, presence: true
    validates :username, :email, uniqueness: true
    validates :password, length: { minimum: 6 }, allow_nil: true
    #aws
    has_one_attached :photo

    has_many :courses
    has_many :subjects
    # has_many :tasks

    after_initialize :ensure_session_token
    attr_reader :password

    def self.find_by_credentials(username, password)
        user = User.find_by(username: username)
        user && user.is_password?(password) ? user : nil
    end

    def password=(password)
        @password = password
        self.password_digest = BCrypt::Password.create(password)
    end

    def is_password?(password)
        BCrypt::Password.new(self.password_digest).is_password?(password)
    end
    def new_session_token
    SecureRandom.urlsafe_base64(16)
    end

    def reset_session_token!
    self.session_token = new_session_token
    self.save!
    self.session_token
    end


    private 
    def ensure_session_token
    self.session_token ||= new_session_token
    end
end
